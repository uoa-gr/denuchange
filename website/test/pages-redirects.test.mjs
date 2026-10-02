import assert from "node:assert/strict"
import test from "node:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { runInNewContext } from "node:vm"
import { buildPagesRedirects } from "../scripts/build-pages-redirects.mjs"

const productionOrigin = "https://denuchange.vercel.app"

function executeRedirect(html, { pathname, search = "", hash = "" }) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]
  assert.ok(head, "The redirect document needs a head")
  const scripts = [...head.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  assert.ok(scripts.length > 0, "The redirect must run in the head before body rendering")
  const navigations = []
  const context = {
    URL,
    window: {
      location: {
        pathname,
        search,
        hash,
        replace: target => { navigations.push(target) },
      },
    },
  }
  for (const script of scripts) runInNewContext(script[1], context, { timeout: 1000 })
  assert.equal(navigations.length, 1, "The redirect should replace the current history entry once")
  return new URL(navigations[0])
}

function assertDestination(html, location, expectedPath) {
  const target = executeRedirect(html, location)
  assert.equal(target.origin, productionOrigin, `Unexpected origin for ${location.pathname}`)
  assert.equal(target.pathname, expectedPath, `Unexpected destination path for ${location.pathname}`)
  assert.equal(target.search, location.search ?? "", `Query was lost for ${location.pathname}`)
  assert.equal(target.hash, location.hash ?? "", `Fragment was lost for ${location.pathname}`)
}

function executeRetiringWorker(source, { scope = "https://uoa-gr.github.io/denuchange/", origin = "https://uoa-gr.github.io", clientUrls = [], failingClientUrl } = {}) {
  const handlers = new Map()
  const actions = []
  const navigations = []
  const clients = clientUrls.map((url, index) => ({
    id: `client-${index}`,
    url,
    type: "window",
    frameType: "top-level",
    visibilityState: "visible",
    focused: true,
    navigate: async target => {
      navigations.push({ from: url, to: target })
      if (url === failingClientUrl) throw new Error("The tab closed during navigation")
    },
  }))
  const forbiddenCaches = {
    keys: () => { throw new Error("The retiring worker must not enumerate origin caches") },
    delete: () => { throw new Error("The retiring worker must not delete origin caches") },
  }
  runInNewContext(source, {
    URL,
    caches: forbiddenCaches,
    self: {
      location: new URL(`${origin}/denuchange/sw.js`),
      caches: forbiddenCaches,
      registration: {
        scope,
        unregister: async () => { actions.push("unregister"); return true },
      },
      skipWaiting: async () => { actions.push("skipWaiting") },
      clients: {
        claim: async () => { actions.push("claim") },
        matchAll: async options => {
          assert.equal(options.type, "window")
          assert.equal(options.includeUncontrolled, true)
          actions.push("matchAll")
          return clients
        },
      },
      addEventListener: (name, handler) => { handlers.set(name, handler) },
    },
  }, { timeout: 1000 })
  return {
    handlers,
    actions,
    navigations,
    async dispatch(name) {
      const pending = []
      handlers.get(name)?.({ waitUntil: promise => { pending.push(promise) } })
      await Promise.all(pending)
      return pending.length
    },
  }
}

test("GitHub Pages produces immediate redirect documents that safely preserve public URLs", async (context) => {
  const temporaryRoot = path.resolve(tmpdir())
  const outputDirectory = await mkdtemp(path.join(temporaryRoot, "denuchange-pages-redirects-"))
  context.after(async () => {
    assert.equal(path.dirname(path.resolve(outputDirectory)), temporaryRoot)
    assert.ok(path.basename(outputDirectory).startsWith("denuchange-pages-redirects-"))
    await rm(outputDirectory, { recursive: true, force: true })
  })
  await buildPagesRedirects(outputDirectory)
  const filenames = ["index.html", "404.html", "agenda/index.html"]
  const documents = Object.fromEntries(await Promise.all(filenames.map(async filename => [
    filename,
    await readFile(path.join(outputDirectory, filename), "utf8"),
  ])))

  await context.test("writes the homepage, fallback and agenda shells without visible redirect text", () => {
    for (const [filename, html] of Object.entries(documents)) {
      const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]
      assert.equal(body?.trim(), "", `${filename} must have a blank body`)
      const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      assert.ok(title && !/redirecting/i.test(title), `${filename} needs a normal workshop title`)
      assert.doesNotMatch(html, /Redirecting/i, `${filename} must not display an intermediate redirect message`)
      const headEnd = html.search(/<\/head>/i)
      const scriptStart = html.search(/<script\b/i)
      const bodyStart = html.search(/<body\b/i)
      assert.ok(scriptStart >= 0 && scriptStart < headEnd && headEnd < bodyStart, `${filename} must execute its redirect before body rendering`)

      const noscript = html.match(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/i)?.[1]
      assert.ok(noscript, `${filename} needs a no-JavaScript fallback`)
      const refresh = noscript.match(/<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*\bcontent=["']([^"']+)["'][^>]*>/i)?.[1]
      const destination = refresh?.match(/^\s*0\s*;\s*url=(.+)$/i)?.[1]
      assert.ok(destination, `${filename} needs a valid immediate refresh destination`)
      const fallback = new URL(destination)
      assert.equal(fallback.origin, productionOrigin)
      assert.equal(fallback.pathname, filename === "agenda/index.html" ? "/agenda" : "/")
    }
  })

  await context.test("forwards root and canonical agenda requests with their query and fragment", () => {
    const cases = [
      ["index.html", "/denuchange/", "/"],
      ["index.html", "/denuchange", "/"],
      ["agenda/index.html", "/denuchange/agenda/", "/agenda"],
      ["agenda/index.html", "/denuchange/agenda/index.html", "/agenda"],
      ["404.html", "/denuchange/agenda", "/agenda"],
    ]
    for (const [filename, pathname, expectedPath] of cases) {
      assertDestination(documents[filename], { pathname, search: "?view=compact&next=%2Fapp%2Fprofile", hash: "#wednesday-block-3" }, expectedPath)
    }
  })

  await context.test("the fallback forwards application, PDF and asset paths without changing their suffixes", () => {
    for (const suffix of ["/app/login", "/app/participants/42", "/DENUCHANGE_Program.pdf", "/images/logo-nkua.jpg", "/assets/index-a1b2.js"]) {
      assertDestination(documents["404.html"], { pathname: `/denuchange${suffix}`, search: "?version=2", hash: "#page=3" }, suffix)
    }
  })

  await context.test("strips the repository prefix only when it matches the start of the path", () => {
    for (const pathname of ["/other/denuchange/agenda/", "/denuchanged/agenda/", "/denuchange-old/agenda/", "/denuchange%2Fagenda/"]) {
      assertDestination(documents["404.html"], { pathname, search: "?source=pages", hash: "#monday" }, pathname)
    }
    assertDestination(documents["404.html"], { pathname: "/agenda/" }, "/agenda")
  })

  await context.test("keeps the fixed Vercel origin when a path contains leading double slashes", () => {
    const cases = [
      ["/denuchange//outside.example/agenda/", "//outside.example/agenda/"],
      ["//outside.example/app/login", "//outside.example/app/login"],
    ]
    for (const [pathname, expectedPath] of cases) {
      assertDestination(documents["404.html"], { pathname, search: "?next=https%3A%2F%2Foutside.example", hash: "#//outside.example" }, expectedPath)
    }
  })
})

test("GitHub Pages retires its old service worker without affecting other repositories", async (context) => {
  const temporaryRoot = path.resolve(tmpdir())
  const outputDirectory = await mkdtemp(path.join(temporaryRoot, "denuchange-pages-worker-"))
  context.after(async () => {
    assert.equal(path.dirname(path.resolve(outputDirectory)), temporaryRoot)
    assert.ok(path.basename(outputDirectory).startsWith("denuchange-pages-worker-"))
    await rm(outputDirectory, { recursive: true, force: true })
  })
  await buildPagesRedirects(outputDirectory)
  const worker = await readFile(path.join(outputDirectory, "sw.js"), "utf8").catch(error => {
    if (error.code === "ENOENT") return ""
    throw error
  })

  await context.test("continues publishing executable JavaScript at the original sw.js path", async () => {
    assert.ok(worker.trim(), "Pages deployments must keep a valid replacement at /denuchange/sw.js")
    const execution = executeRetiringWorker(worker)
    assert.deepEqual([...execution.handlers.keys()].sort(), ["activate", "install"])
    assert.equal(await execution.dispatch("install"), 1)
    assert.deepEqual(execution.actions, ["skipWaiting"])
  })

  await context.test("claims its clients then unregisters only its own registration", async () => {
    const execution = executeRetiringWorker(worker)
    assert.equal(await execution.dispatch("activate"), 1)
    assert.deepEqual(execution.actions, ["claim", "unregister", "matchAll"])
    assert.equal(execution.handlers.has("fetch"), false)
  })

  await context.test("moves only anchored repository clients to Vercel while preserving their URLs", async () => {
    const cases = [
      ["https://uoa-gr.github.io/denuchange?source=pages#top", "https://denuchange.vercel.app/?source=pages#top"],
      ["https://uoa-gr.github.io/denuchange/", "https://denuchange.vercel.app/"],
      ["https://uoa-gr.github.io/denuchange/agenda/?view=compact#wednesday-block-3", "https://denuchange.vercel.app/agenda?view=compact#wednesday-block-3"],
      ["https://uoa-gr.github.io/denuchange/agenda/index.html#tuesday", "https://denuchange.vercel.app/agenda#tuesday"],
      ["https://uoa-gr.github.io/denuchange/agenda", "https://denuchange.vercel.app/agenda"],
      ["https://uoa-gr.github.io/denuchange/app/program?next=%2Fapp%2Fprofile#day-2", "https://denuchange.vercel.app/app/program?next=%2Fapp%2Fprofile#day-2"],
      ["https://uoa-gr.github.io/denuchange/DENUCHANGE_Program.pdf?version=2#page=3", "https://denuchange.vercel.app/DENUCHANGE_Program.pdf?version=2#page=3"],
      ["https://uoa-gr.github.io/denuchange//outside.example/app?next=https%3A%2F%2Foutside.example#//outside.example", "https://denuchange.vercel.app//outside.example/app?next=https%3A%2F%2Foutside.example#//outside.example"],
    ]
    const untouched = [
      "https://uoa-gr.github.io/other/denuchange/agenda/",
      "https://uoa-gr.github.io/denuchanged/agenda/",
      "https://uoa-gr.github.io/denuchange-old/agenda/",
      "https://uoa-gr.github.io/denuchange%2Fagenda/",
      "https://uoa-gr.github.io/denuchange/../other/",
      "https://outside.example/denuchange/agenda/",
      "https://uoa-gr.github.io.outside.example/denuchange/agenda/",
      "about:blank",
    ]
    const execution = executeRetiringWorker(worker, { clientUrls: [...cases.map(([url]) => url), ...untouched] })
    await execution.dispatch("activate")
    assert.deepEqual(execution.navigations, cases.map(([from, to]) => ({ from, to })))
    assert.ok(execution.navigations.every(({ to }) => new URL(to).origin === productionOrigin))
  })

  await context.test("takes no action when installed with an unexpected scope or origin", async () => {
    for (const settings of [
      { scope: "https://uoa-gr.github.io/" },
      { scope: "https://uoa-gr.github.io/other/" },
      { scope: "https://uoa-gr.github.io/denuchange-old/" },
      { scope: "https://uoa-gr.github.io/denuchange" },
      { origin: "https://outside.example", scope: "https://outside.example/denuchange/" },
    ]) {
      const execution = executeRetiringWorker(worker, { ...settings, clientUrls: ["https://uoa-gr.github.io/other/"] })
      await execution.dispatch("install")
      await execution.dispatch("activate")
      assert.deepEqual(execution.actions, [], `Unexpected activity for ${JSON.stringify(settings)}`)
      assert.deepEqual(execution.navigations, [])
      assert.equal(execution.handlers.has("fetch"), false)
    }
  })

  await context.test("a closing tab cannot prevent other repository clients from being moved", async () => {
    const first = "https://uoa-gr.github.io/denuchange/app/program"
    const second = "https://uoa-gr.github.io/denuchange/agenda/"
    const execution = executeRetiringWorker(worker, { clientUrls: [first, second], failingClientUrl: first })
    await execution.dispatch("activate")
    assert.deepEqual(execution.navigations, [
      { from: first, to: "https://denuchange.vercel.app/app/program" },
      { from: second, to: "https://denuchange.vercel.app/agenda" },
    ])
  })
})
