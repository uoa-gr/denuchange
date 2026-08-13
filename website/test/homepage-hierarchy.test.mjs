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

  await context.test("groups organisers and supporters immediately before About", () => {
    assert.equal(typeof CoOrganiser, "function", "CoOrganiser section is missing")

    const markup = renderToStaticMarkup(React.createElement(About))
    const creditPosition = markup.indexOf("Co-organised with:")
    const supportPosition = markup.indexOf("Supported by:")
    const aboutPosition = markup.indexOf("About the Workshop")
    const organisations = [
      ["IAG", "https://www.geomorph.org/", "/images/logo-iag.jpg"],
      ["DENUCHANGE", "https://www.geomorph.org/denuchange-working-group-4/", "/images/logo-denuchange.jpg"],
      ["NKUA", "https://en.uoa.gr/", "/images/logo-nkua.jpg"],
      ["Virtual Trips in Geomorphology", "https://www.geomorph.org/virtual-trips-in-geomorphology/", "/images/logo-vft-working-group.png"],
      ["Laguna Coast Foundation", "https://lagunacoast.org/", "/images/laguna-coast-foundation.png"],
    ]

    assert.ok(creditPosition >= 0, "co-organiser credit is missing")
    assert.ok(supportPosition >= 0, "supporter credit is missing")
    assert.ok(aboutPosition >= 0, "About heading is missing")
    assert.ok(creditPosition < supportPosition, "co-organisers should precede supporters")
    assert.ok(supportPosition < aboutPosition, "supporters should precede About")

    for (const [title, href, image] of organisations) {
      assert.ok(markup.includes(`href="${href}"`), `${title} link is missing before About`)
      assert.ok(markup.includes(`src="${image}"`), `${title} image is missing before About`)
      assert.ok(markup.includes(title), `${title} title is missing before About`)
    }

    assert.equal(
      markup.split('href="https://www.geomorph.org/virtual-trips-in-geomorphology/"').length - 1,
      2,
      "VFT should appear as both an organiser and a supporter",
    )
    assert.equal(
      markup.split('src="/images/logo-vft-working-group.png"').length - 1,
      2,
      "both VFT entries should use the programme logo",
    )
    assert.ok(!markup.includes("/images/virtual-trips-in-geomorphology.jpg"))
  })

  await context.test("keeps organisation cards out of the footer", () => {
    const markup = renderToStaticMarkup(React.createElement(Footer))

    assert.ok(!markup.includes("https://www.geomorph.org/"))
    assert.ok(!markup.includes("https://lagunacoast.org/"))
    assert.ok(markup.includes("© 2026 IAG DENUCHANGE Working Group"))
  })
})
