import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { runInNewContext } from "node:vm"
import { createServer } from "vite"
import ts from "typescript"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

function fakeEvents() {
  const listeners = new Map()
  return {
    addEventListener(type, listener) { listeners.set(type, listener) },
    dispatch(type) { listeners.get(type)?.() },
  }
}

function registrationHarness(main) {
  // Execute the real registration statements without mounting the React application.
  const source = ts.createSourceFile("main.tsx", main, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const registrationIndex = source.statements.findIndex(statement => ts.isExpressionStatement(statement) &&
    ts.isCallExpression(statement.expression) && statement.expression.expression.getText(source) === "registerSW")
  assert.ok(registrationIndex >= 0, "Service worker registration must be present")
  const statements = source.statements.slice(0, registrationIndex + 1).filter(statement => !ts.isImportDeclaration(statement))
  const printer = ts.createPrinter()
  const registrationCode = statements.map(statement => printer.printNode(ts.EmitHint.Unspecified, statement, source)).join("\n")
  const requests = []
  const intervals = []
  const window = { ...fakeEvents(), setInterval(callback, delay) { intervals.push({ callback, delay }) } }
  const document = { ...fakeEvents(), visibilityState: "visible" }
  const navigator = { onLine: true }
  let options
  let updates = 0
  const registration = { installing: false, async update() { updates += 1 } }
  runInNewContext(registrationCode, {
    window, document, navigator,
    registerSW(value) { options = value },
    fetch(url, requestOptions) {
      return new Promise((resolve, reject) => { requests.push({ url, options: requestOptions, resolve, reject }) })
    },
  })
  return { options, requests, intervals, window, document, navigator, registration, updates: () => updates }
}

const settle = () => new Promise(resolve => setImmediate(resolve))

test("online navigation fetches current HTML while retaining an offline shell", async (context) => {
  const captureId = "\0test-pwa-options"
  const vite = await createServer({
    root: projectRoot,
    configFile: false,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    ssr: { noExternal: ["vite-plugin-pwa"] },
    plugins: [{
      name: "capture-actual-pwa-configuration",
      enforce: "pre",
      resolveId(id) { if (id === "vite-plugin-pwa") return captureId },
      load(id) { if (id === captureId) return 'export function VitePWA(options) { return [{ name: "captured-pwa", pwaOptions: options }] }' },
      transform(code, id) {
        // Vite's normal config loader supplies __dirname; SSR modules need its value.
        if (id.replace(/\\/g, "/").endsWith("/vite.config.ts")) return code.replace(/\b__dirname\b/g, JSON.stringify(projectRoot))
      },
    }],
  })
  context.after(async () => { await vite.close() })
  const loadedConfig = await vite.ssrLoadModule("/vite.config.ts")
  const pwa = loadedConfig.default.plugins.flat(Infinity).find(plugin => plugin.name === "captured-pwa")?.pwaOptions
  assert.ok(pwa, "The real Vite config must provide PWA options")
  assert.equal(pwa.registerType, "autoUpdate")
  assert.equal(pwa.workbox.navigateFallback, null, "A precached navigation route must not shadow network navigation")
  assert.equal(pwa.workbox.directoryIndex, null, "The precache route must not map the homepage to stale index.html")
  const navigation = pwa.workbox.runtimeCaching.find(rule => typeof rule.urlPattern === "function")
  assert.ok(navigation, "A navigation matcher is required")
  assert.equal(navigation.handler, "NetworkOnly")
  assert.equal(navigation.options?.precacheFallback?.fallbackURL, "index.html", "Offline fallback must resolve relative to the service worker scope")

  const origin = "https://denuchange.vercel.app"
  for (const pathname of ["/", "/?source=homepage", "/agenda", "/agenda?mode=compact", "/app/program", "/app/program?day=2026-10-06"]) {
    assert.equal(navigation.urlPattern({ request: { mode: "navigate" }, url: new URL(pathname, origin), sameOrigin: true }), true, `Online navigation must use the network: ${pathname}`)
  }
  for (const pathname of ["/api", "/api/program", "/_vercel", "/_vercel/insights", "/DENUCHANGE_Program.pdf", "/other.PDF?download=1"]) {
    assert.equal(navigation.urlPattern({ request: { mode: "navigate" }, url: new URL(pathname, origin), sameOrigin: true }), false, `Navigation fallback must not intercept ${pathname}`)
  }
  assert.equal(navigation.urlPattern({ request: { mode: "cors" }, url: new URL("/agenda", origin), sameOrigin: true }), false)
  assert.equal(navigation.urlPattern({ request: { mode: "navigate" }, url: new URL("https://outside.example/agenda"), sameOrigin: false }), false)
})

test("deployment-sensitive HTTP responses must be revalidated", () => {
  const vercelConfig = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8"),
  )

  const globalHeaders = vercelConfig.headers?.find(({ source }) => source === "/(.*)")
  assert.ok(globalHeaders, "global cache revalidation headers are missing")
  assert.ok(
    globalHeaders.headers.some(
      ({ key, value }) =>
        key.toLowerCase() === "cache-control" &&
        value === "public, max-age=0, must-revalidate",
    ),
    "browser and CDN caches must revalidate every deployment-sensitive response",
  )
})

test("worker update checks deduplicate requests and resume after focus, visibility and reconnect", async () => {
  const main = fs.readFileSync(path.join(projectRoot, "src", "main.tsx"), "utf8")
  const state = registrationHarness(main)
  assert.equal(state.options.immediate, true)
  state.options.onRegisteredSW("/sw.js", state.registration)
  assert.equal(state.requests.length, 1)
  assert.equal(state.requests[0].url, "/sw.js")
  assert.equal(state.requests[0].options.cache, "no-store")
  assert.equal(state.requests[0].options.headers["cache-control"], "no-cache")
  assert.equal(state.intervals.length, 1)
  assert.equal(state.intervals[0].delay, 60_000)
  state.window.dispatch("focus")
  state.window.dispatch("online")
  state.document.dispatch("visibilitychange")
  state.intervals[0].callback()
  assert.equal(state.requests.length, 1, "A pending update check must not spawn overlapping reads")
  state.requests[0].resolve({ ok: true })
  await settle()
  assert.equal(state.updates(), 1)

  state.document.visibilityState = "hidden"
  state.document.dispatch("visibilitychange")
  assert.equal(state.requests.length, 1)
  state.document.visibilityState = "visible"
  state.document.dispatch("visibilitychange")
  assert.equal(state.requests.length, 2)
  state.requests[1].resolve({ ok: false })
  await settle()
  assert.equal(state.updates(), 1, "Failed HTTP probes must not activate an update")
  state.window.dispatch("focus")
  assert.equal(state.requests.length, 3)
  state.requests[2].reject(new Error("Temporarily offline"))
  await settle()
  state.window.dispatch("online")
  assert.equal(state.requests.length, 4, "Reconnect must retry a previously failed check")
  state.requests[3].resolve({ ok: true })
  await settle()
  assert.equal(state.updates(), 2)
})

test("worker update checks skip unavailable registration, offline clients and active installation", async () => {
  const main = fs.readFileSync(path.join(projectRoot, "src", "main.tsx"), "utf8")
  const state = registrationHarness(main)
  state.options.onRegisteredSW("/sw.js", undefined)
  assert.equal(state.requests.length, 0)
  assert.equal(state.intervals.length, 0)
  state.navigator.onLine = false
  state.options.onRegisteredSW("/sw.js", state.registration)
  assert.equal(state.requests.length, 0)
  state.window.dispatch("focus")
  state.intervals[0].callback()
  assert.equal(state.requests.length, 0)
  state.navigator.onLine = true
  state.registration.installing = true
  state.window.dispatch("online")
  assert.equal(state.requests.length, 0)
  state.registration.installing = false
  state.window.dispatch("online")
  assert.equal(state.requests.length, 1)
  state.requests[0].resolve({ ok: true })
  await settle()
  assert.equal(state.updates(), 1)
})
