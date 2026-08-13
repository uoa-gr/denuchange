import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

test("footer contains only the workshop credits", async (context) => {
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

  assert.ok(markup.includes("© 2026 IAG DENUCHANGE Working Group"))
  assert.ok(markup.includes("5th International Workshop"))
  assert.ok(markup.includes("Developed by"))
  assert.ok(!markup.includes("Organization Cards"))
  assert.ok(!markup.includes("https://lagunacoast.org/"))
})
