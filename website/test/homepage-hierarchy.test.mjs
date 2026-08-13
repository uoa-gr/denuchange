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
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://example.supabase.co"),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("test-publishable-key"),
    },
  })

  context.after(async () => {
    await vite.close()
  })

  const [heroModule, aboutModule, footerModule, registrationModule] = await Promise.all([
    vite.ssrLoadModule("/src/components/sections/Hero.tsx"),
    vite.ssrLoadModule("/src/components/sections/About.tsx"),
    vite.ssrLoadModule("/src/components/layout/Footer.tsx"),
    vite.ssrLoadModule("/src/components/sections/Registration.tsx"),
  ])
  const { Hero } = heroModule
  const { About, CoOrganiser } = aboutModule
  const { Footer } = footerModule
  const { Registration } = registrationModule

  await context.test("keeps only the current event facts inside the hero", () => {
    const markup = renderToStaticMarkup(React.createElement(Hero))

    assert.match(markup, />Date</)
    assert.match(markup, /6(?:–|‑|-)9 October 2026/)
    assert.match(markup, />Location</)
    assert.match(markup, />Naxos, Greece</)
    assert.doesNotMatch(markup, />Abstracts</)
    assert.doesNotMatch(markup, /<dd[^>]*>\s*Closed\s*<\/dd>/)
  })

  await context.test("presents abstract submission as a closed status, not an action", () => {
    const markup = renderToStaticMarkup(React.createElement(Registration))

    assert.match(markup, /Abstract Submission Closed/)
    assert.match(markup, /role="status"/)
    assert.match(markup, />Submissions Closed</)
    assert.doesNotMatch(markup, />Submit Abstract<\/button>/)
    assert.doesNotMatch(markup, /plan to submit an abstract/i)
  })

  await context.test("gives the refreshed hero one clear accessible hierarchy", () => {
    const markup = renderToStaticMarkup(React.createElement(Hero))

    assert.match(markup, /<section[^>]*aria-labelledby="hero-heading"/)
    assert.match(markup, /<h1[^>]*id="hero-heading"/)
    assert.match(markup, /<nav[^>]*aria-label="Workshop actions"/)
    assert.match(markup, /<a[^>]*href="#registration"[^>]*>Register Now<\/a>/)
    assert.match(markup, /<a[^>]*href="#program"[^>]*>View Program<\/a>/)
  })

  await context.test("groups organisers and supporters immediately before About", () => {
    assert.equal(typeof CoOrganiser, "function", "CoOrganiser section is missing")

    const markup = renderToStaticMarkup(React.createElement(About))
    const creditPosition = markup.indexOf("Co-organised with:")
    const supportPosition = markup.indexOf("Supported by:")
    const aboutPosition = markup.indexOf("About the Workshop")
    const organisations = [
      ["National and Kapodistrian University of Athens", "https://en.uoa.gr/", "/images/logo-nkua.jpg"],
      ["Laguna Coast Foundation", "https://lagunacoast.org/", "/images/laguna-coast-foundation.png"],
      ["International Association of Geomorphologists", "https://www.geomorph.org/", "/images/logo-iag.jpg"],
      ["IAG Working Group Denudation and Environmental Changes in Different Morphoclimatic Zones (DENUCHANGE)", "https://www.geomorph.org/denuchange-working-group-4/", "/images/logo-denuchange.jpg"],
      ["IAG Working Group Virtual Trips in Geomorphology", "https://www.geomorph.org/virtual-trips-in-geomorphology/", "/images/logo-vft-working-group.png"],
    ]
    const supporter = [
      "Municipality of Naxos and Small Cyclades",
      "https://e-naxos.eu/",
      "/images/municipality-naxos-small-cyclades.png",
    ]

    assert.ok(creditPosition >= 0, "co-organiser credit is missing")
    assert.ok(supportPosition >= 0, "supporter credit is missing")
    assert.ok(aboutPosition >= 0, "About heading is missing")
    assert.ok(creditPosition < supportPosition, "co-organisers should precede supporters")
    assert.ok(supportPosition < aboutPosition, "supporters should precede About")
    assert.match(
      markup,
      /<ol[^>]*aria-label="Co-organising institutions and working groups"/,
      "co-organisers should use one semantic institutional register",
    )
    assert.equal(
      markup.match(/<li/g)?.length,
      organisations.length,
      "each co-organiser should occupy one register row",
    )
    assert.ok(
      !markup.includes("grid grid-cols-1 gap-4 md:grid-cols-6"),
      "co-organisers should not use the oversized card grid",
    )

    for (const [title, href, image] of organisations) {
      assert.ok(markup.includes(`href="${href}"`), `${title} link is missing before About`)
      assert.ok(markup.includes(`src="${image}"`), `${title} image is missing before About`)
      assert.ok(markup.includes(title), `${title} title is missing before About`)
    }

    const organisationPositions = organisations.map(([title]) => markup.indexOf(title))
    assert.deepEqual(
      organisationPositions,
      [...organisationPositions].sort((a, b) => a - b),
      "co-organisers should follow the order in the programme",
    )

    const [supporterTitle, supporterHref, supporterImage] = supporter
    assert.ok(markup.includes(`href="${supporterHref}"`), `${supporterTitle} link is missing`)
    assert.ok(markup.includes(`src="${supporterImage}"`), `${supporterTitle} image is missing`)
    assert.ok(markup.includes(supporterTitle), `${supporterTitle} title is missing`)
    assert.ok(!markup.includes("Workshop co-organiser"), "programme names should not have invented subtitles")

    assert.equal(
      markup.split('href="https://www.geomorph.org/virtual-trips-in-geomorphology/"').length - 1,
      1,
      "VFT should appear only as an organising body",
    )
    assert.equal(
      markup.split('src="/images/logo-vft-working-group.png"').length - 1,
      1,
      "the VFT logo should appear only once",
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
