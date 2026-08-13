import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

test("homepage presents the approved workshop hierarchy", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })

  context.after(async () => {
    await vite.close()
  })

  const [heroModule, aboutModule, footerModule] = await Promise.all([
    vite.ssrLoadModule("/src/components/sections/Hero.tsx"),
    vite.ssrLoadModule("/src/components/sections/About.tsx"),
    vite.ssrLoadModule("/src/components/layout/Footer.tsx"),
  ])
  const { Hero } = heroModule
  const { About, CoOrganiser } = aboutModule
  const { Footer } = footerModule

  await context.test("keeps the three essential facts inside the hero", () => {
    const markup = renderToStaticMarkup(React.createElement(Hero))

    assert.match(markup, />Date</)
    assert.match(markup, /6(?:–|‑|-)9 October 2026/)
    assert.match(markup, />Location</)
    assert.match(markup, />Naxos, Greece</)
    assert.match(markup, />Abstracts</)
    assert.match(markup, />Closed</)
    assert.match(markup, /<dd[^>]*>\s*Closed\s*<\/dd>/)
  })

  await context.test("credits Laguna Coast immediately before About", () => {
    assert.equal(typeof CoOrganiser, "function", "CoOrganiser section is missing")

    const markup = renderToStaticMarkup(React.createElement(About))
    const creditPosition = markup.indexOf("Co-organised with:")
    const aboutPosition = markup.indexOf("About the Workshop")

    assert.ok(creditPosition >= 0, "co-organiser credit is missing")
    assert.ok(aboutPosition >= 0, "About heading is missing")
    assert.ok(creditPosition < aboutPosition, "co-organiser credit should precede About")
    assert.ok(markup.includes('href="https://lagunacoast.org/"'))
    assert.ok(markup.includes('src="/images/laguna-coast-foundation.png"'))
    assert.match(markup, />Laguna Coast Foundation<\/span>/)
  })

  await context.test("uses the formal co-organiser role in the footer", () => {
    const markup = renderToStaticMarkup(React.createElement(Footer))

    assert.ok(markup.includes("Workshop co-organiser"))
    assert.ok(!markup.includes("Naxos sustainability initiative"))
  })
})
