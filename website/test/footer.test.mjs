import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

test("footer renders the Virtual Trips and Laguna Coast partner links", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })

  context.after(async () => {
    await vite.close()
  })

  const { Footer } = await vite.ssrLoadModule("/src/components/layout/Footer.tsx")
  const markup = renderToStaticMarkup(React.createElement(Footer))

  const partners = [
    {
      title: "Virtual Trips in Geomorphology",
      href: "https://www.geomorph.org/virtual-trips-in-geomorphology/",
      image: "/images/virtual-trips-in-geomorphology.jpg",
    },
    {
      title: "Laguna Coast Foundation",
      href: "https://lagunacoast.org/",
      image: "/images/laguna-coast-foundation.png",
    },
  ]

  for (const partner of partners) {
    assert.ok(markup.includes(`href="${partner.href}"`), `${partner.title} link is missing`)
    assert.ok(markup.includes(`src="${partner.image}"`), `${partner.title} image is missing`)
    assert.ok(markup.includes(partner.title), `${partner.title} title is missing`)
  }
})
