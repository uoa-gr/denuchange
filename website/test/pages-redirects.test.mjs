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
