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
const origin = "https://denuchange.vercel.app"

async function pwaOptions(context) {
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
        if (id.replace(/\\/g, "/").endsWith("/vite.config.ts")) return code.replace(/\b__dirname\b/g, JSON.stringify(projectRoot))
      },
    }],
  })
  context.after(async () => { await vite.close() })
  const loadedConfig = await vite.ssrLoadModule("/vite.config.ts")
  const plugins = loadedConfig.default.plugins.flat(Infinity)
  return { options: plugins.find(plugin => plugin.name === "captured-pwa")?.pwaOptions, plugins }
}

function workerHarness() {
  const workerPath = path.join(projectRoot, "src", "sw.ts")
  assert.ok(fs.existsSync(workerPath), "A custom service worker must own navigation route order")
  const code = ts.transpileModule(fs.readFileSync(workerPath, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
  const routes = []
  const fetches = []
  const precacheReads = []
  const importedScripts = []
  const settings = { response: new Response("Current deployment HTML"), offlineResponse: new Response("Offline shell"), error: undefined }
  let skipWaiting = 0
  const modules = {
    "workbox-routing": {
      registerRoute(matcher, handler) { routes.push({ matcher, handler, type: "registered" }) },
    },
    "workbox-precaching": {
      precacheAndRoute(_manifest, options) {
        routes.push({ type: "precache", options, matcher: ({ url }) => ["/index", "/index.html"].includes(url.pathname) })
      },
      cleanupOutdatedCaches() {},
      async matchPrecache(url) { precacheReads.push(url); return settings.offlineResponse },
    },
    "workbox-strategies": { CacheFirst: class CacheFirst { constructor(options) { this.options = options } } },
    "workbox-expiration": { ExpirationPlugin: class ExpirationPlugin { constructor(options) { this.options = options } } },
    "workbox-cacheable-response": { CacheableResponsePlugin: class CacheableResponsePlugin { constructor(options) { this.options = options } } },
  }
  runInNewContext(code, {
    exports: {}, URL,
    require(id) { assert.ok(modules[id], `Unexpected worker dependency: ${id}`); return modules[id] },
    self: {
      registration: { scope: origin + "/" },
      __WB_MANIFEST: [{ url: "index.html", revision: "test-revision" }],
      importScripts(url) { importedScripts.push(url) },
      skipWaiting() { skipWaiting += 1; return Promise.resolve() },
    },
    async fetch(request, options) {
      fetches.push({ request, options })
      if (settings.error) throw settings.error
      return settings.response
    },
  })
  const input = (pathname, mode = "navigate", sameOrigin = true) => ({ request: { mode, url: new URL(pathname, origin).href }, url: new URL(pathname, origin), sameOrigin })
  const navigation = routes.find(route => route.type === "registered" && typeof route.matcher === "function")
  return { routes, navigation, settings, fetches, precacheReads, importedScripts, skipWaiting, input }
}

test("custom worker configuration preserves installability and excludes freshness probes from precaching", async (context) => {
  const { options, plugins } = await pwaOptions(context)
  assert.ok(options)
  assert.equal(options.strategies, "injectManifest")
  assert.equal(options.srcDir, "src")
  assert.equal(options.filename, "sw.ts")
  assert.equal(options.injectRegister, false)
  assert.equal(options.injectManifest.rollupFormat, "iife")
  assert.equal(options.registerType, "autoUpdate")
  assert.equal(options.manifest.start_url, "/app/")
  assert.equal(options.manifest.scope, "/")
  for (const resource of ["browser-refresh.js", "version.json"]) {
    assert.ok(options.injectManifest.globIgnores.some(glob => glob === resource || glob === `**/${resource}`), `${resource} must not be served from the worker precache`)
  }
  assert.ok(plugins.some(plugin => /freshness/i.test(plugin.name)), "Release bootstrap metadata must be emitted with each build")
})

test("online HTML navigations including explicit index paths precede precached HTML", async () => {
  const state = workerHarness()
  assert.ok(state.navigation)
  assert.ok(state.routes.indexOf(state.navigation) < state.routes.findIndex(route => route.type === "precache"))
  for (const pathname of ["/", "/index", "/index.html", "/?source=homepage", "/agenda", "/agenda?mode=compact", "/app/program", "/app/program?day=2026-10-06"]) {
    const input = state.input(pathname)
    assert.equal(state.navigation.matcher(input), true, `Navigation must use the network: ${pathname}`)
    const firstMatch = state.routes.find(route => typeof route.matcher === 'function' && route.matcher(input))
    assert.equal(firstMatch, state.navigation, `Cached HTML must not shadow ${pathname}`)
    const result = await firstMatch.handler(input)
    assert.equal(await result.clone().text(), "Current deployment HTML")
    const read = state.fetches.at(-1)
    assert.equal(read.request, input.request)
    assert.equal(read.options.cache, "no-store", "Browser HTTP cache must not supply stale navigation HTML")
  }
  assert.equal(state.precacheReads.length, 0, "Successful online navigation must not read precached HTML")
})

test("offline navigation uses its scoped precached shell and preserves the original failure when unavailable", async () => {
  const state = workerHarness()
  const failure = new Error("Network unavailable")
  state.settings.error = failure
  const result = await state.navigation.handler(state.input("/app/program"))
  assert.equal(await result.text(), "Offline shell")
  assert.deepEqual(state.precacheReads, ["index.html"])
  state.settings.offlineResponse = undefined
  await assert.rejects(state.navigation.handler(state.input("/agenda")), error => error === failure)
})

test("navigation handling does not intercept API, analytics, PDFs or other origins", () => {
  const state = workerHarness()
  for (const pathname of ["/api", "/api/program", "/_vercel", "/_vercel/insights", "/DENUCHANGE_Program.pdf", "/other.PDF?download=1"]) {
    assert.equal(state.navigation.matcher(state.input(pathname)), false, `Navigation fallback must not intercept ${pathname}`)
  }
  assert.equal(state.navigation.matcher(state.input("/agenda", "cors")), false)
  assert.equal(state.navigation.matcher(state.input("https://outside.example/agenda", "navigate", false)), false)
  assert.equal(state.fetches.length, 0)
})

test("worker imports scoped activation recovery and retains the font cache policy", () => {
  const state = workerHarness()
  assert.deepEqual(state.importedScripts, [origin + "/sw-refresh.js"])
  assert.equal(state.skipWaiting, 1)
  const fonts = state.routes.find(route => route.matcher instanceof RegExp || route.matcher?.constructor?.name === "RegExp")
  assert.ok(fonts)
  assert.equal(fonts.matcher.test("https://fonts.googleapis.com/css2?family=Inter"), true)
  assert.equal(fonts.matcher.test("https://outside.example/font.css"), false)
  assert.equal(fonts.handler.options.cacheName, "google-fonts-cache")
  assert.equal(fonts.handler.options.plugins[0].options.maxEntries, 10)
  assert.equal(fonts.handler.options.plugins[0].options.maxAgeSeconds, 31_536_000)
  assert.deepEqual(Array.from(fonts.handler.options.plugins[1].options.statuses), [0, 200])
})

test("deployment-sensitive HTTP responses must be revalidated", () => {
  const config = JSON.parse(fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8"))
  const globalHeaders = config.headers?.find(({ source }) => source === "/(.*)")
  assert.ok(globalHeaders)
  assert.ok(globalHeaders.headers.some(({ key, value }) => key.toLowerCase() === "cache-control" && value === "public, max-age=0, must-revalidate"))
})
