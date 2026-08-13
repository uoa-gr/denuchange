import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

const programCopy = [
  "Program",
  "Workshop Schedule",
  "Two days of presentations and discussions, followed by a two-day field excursion exploring Naxos's diverse geomorphological features.",
  "October 6-7",
  "Workshop Sessions",
  "Oral & poster presentations",
  "Coffee breaks & lunches included",
  "Workshop Dinner (Oct 7)",
  "October 8-9",
  "Field Trip",
  "Catchment to coast transect",
  "Naxos geomorphological sites",
  "Lunches included",
  "Note:",
  "Detailed program with session times will be announced closer to the event.",
]

const labsCopy = [
  "Labs",
  "Virtual Field Trip Laboratories",
  'Hands-on interactive sessions offered by the IAG Working Group "Virtual Field Trips in Geomorphology" running alongside the workshop program.',
  "VFT Design & Application",
  "Practical experience in designing and applying Virtual Field Trips for geomorphological research and education.",
  "VR Immersion",
  "Use VR headsets to explore immersive examples of Virtual Field Trips firsthand.",
  "Cross-Working Group Collaboration",
  "Fostering active collaboration between members of the DENUCHANGE and VFT Working Groups.",
  "Skill Enhancement",
  "Exchange of innovative ideas and skill development, with a particular focus on early-career geomorphologists.",
]

function normalize(markup) {
  return markup.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim()
}

test("Program and Labs retain their approved copy in clearer semantic layouts", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })

  context.after(async () => {
    await vite.close()
  })

  const [programModule, labsModule] = await Promise.all([
    vite.ssrLoadModule("/src/components/sections/Program.tsx"),
    vite.ssrLoadModule("/src/components/sections/Labs.tsx"),
  ])

  const programMarkup = renderToStaticMarkup(React.createElement(programModule.Program))
  const labsMarkup = renderToStaticMarkup(React.createElement(labsModule.Labs))

  await context.test("presents Program as a labelled two-part itinerary", () => {
    assert.match(programMarkup, /<section[^>]*aria-labelledby="program-heading"/)
    assert.match(programMarkup, /<h2[^>]*id="program-heading"/)
    assert.match(programMarkup, /<ol[^>]*aria-label="Workshop schedule"/)
    assert.equal(programMarkup.match(/<li(?:\s|>)/g)?.length, 8)
  })

  await context.test("presents Labs as one labelled focus-area list", () => {
    assert.match(labsMarkup, /<section[^>]*aria-labelledby="labs-heading"/)
    assert.match(labsMarkup, /<h2[^>]*id="labs-heading"/)
    assert.match(labsMarkup, /<ul[^>]*aria-label="Laboratory focus areas"/)
    assert.equal(labsMarkup.match(/<li(?:\s|>)/g)?.length, 4)
  })

  await context.test("preserves every approved Program and Labs text", () => {
    const programText = normalize(programMarkup)
    const labsText = normalize(labsMarkup)

    for (const text of programCopy) assert.ok(programText.includes(text), `Program text changed: ${text}`)
    for (const text of labsCopy) assert.ok(labsText.includes(text), `Labs text changed: ${text}`)
  })
})
