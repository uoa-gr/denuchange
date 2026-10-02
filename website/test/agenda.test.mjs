import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { access, readFile, readdir } from "node:fs/promises"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

function visibleText(markup) {
  return markup
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number(code)))
}

function normalize(text) {
  return text.normalize("NFC")
    .replace(/\u00ad/g, "")
    .replace(/(\p{L})-\s+(\p{L})/gu, "$1-$2")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .trim()
}

test("the public agenda preserves the PDF programme and remains an unlisted page", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })
  context.after(async () => { await vite.close() })

  const [pageModule, dataModule, sourceFixture] = await Promise.all([
    vite.ssrLoadModule("/src/pages/agenda/AgendaPage.tsx"),
    vite.ssrLoadModule("/src/pages/agenda/agenda-data.ts"),
    readFile(path.join(testDirectory, "fixtures", "agenda-source.txt"), "utf8"),
  ])
  const markup = renderToStaticMarkup(React.createElement(pageModule.AgendaPage))
  const renderedText = normalize(visibleText(markup))

  await context.test("renders every source paragraph, including authors and committees", () => {
    const fragments = sourceFixture.split(/\r?\n\s*\r?\n/).map(normalize).filter(Boolean)
    const missing = fragments.filter(fragment => !renderedText.includes(fragment))
    assert.deepEqual(missing, [], "Source programme content is missing or changed")
  })

  await context.test("preserves the PDF poster numbering and literal time anomalies", () => {
    const posterNumbers = [...renderedText.matchAll(/\bP(\d{1,2})\b/g)].map(match => `P${match[1]}`)
    assert.deepEqual([...new Set(posterNumbers)], ["P1", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"])
    assert.ok(renderedText.includes("11:45-11:15"), "The source's 11:45-11:15 time must be retained")
    assert.ok(renderedText.includes("11:45-11:-50"), "The source's 11:45-11:-50 time must be retained")
  })

  await context.test("keeps talks attached to their correct Tuesday time slots", () => {
    const tuesday = dataModule.days.find(day => day.id === "tuesday")
    const entries = tuesday.blocks.flatMap(block => block.entries)
    const historicalModelling = entries.find(entry => entry.time === "12:55-13:10")
    assert.equal(historicalModelling.title, "Toward the integration of historical data in erosion modelling: the case of Badlands landscapes of Aliano (Basilicata, Southern Italy)")
    assert.deepEqual(historicalModelling.speakers, ["Santoro G., Mairota P., Capolongo D., Marsico A."])
    const debrisFlow = entries.find(entry => entry.time === "17:20-17:35")
    assert.equal(debrisFlow.title, "Debris flow release susceptibility and sediment connectivity in the Russian sector of the Greater Caucasus")
    assert.deepEqual(debrisFlow.speakers, ["Posazhennikova V., Golosov V. N., Kharchenko S. V."])
  })

  await context.test("uses existing assets for every workshop and organization logo", async () => {
    const imageSources = [...markup.matchAll(/<img[^>]*\bsrc="([^"]+)"/g)].map(match => match[1])
    assert.ok(imageSources.length >= dataModule.organizingBodies.length, "Organization logos are missing")
    for (const src of imageSources) {
      assert.ok(!/^https?:/.test(src), `Expected the existing local workshop asset: ${src}`)
      await assert.doesNotReject(access(path.join(projectRoot, "public", src.replace(/^\/+/, ""))), `Logo asset does not exist: ${src}`)
    }
  })

  await context.test("provides a main landmark, page heading and reachable day navigation", () => {
    assert.equal(markup.match(/<main(?:\s|>)/g)?.length, 1)
    assert.equal(markup.match(/<h1(?:\s|>)/g)?.length, 1)
    assert.match(markup, /<nav[^>]*aria-label="[^"]+"/)
    const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
    const anchors = [...markup.matchAll(/href="#([^"]+)"/g)].map(match => match[1])
    assert.ok(anchors.length >= dataModule.days.length, "Day navigation is missing")
    for (const anchor of anchors) assert.ok(ids.has(anchor), `In-page link #${anchor} has no destination`)
    for (const day of dataModule.days) {
      assert.ok(anchors.includes(day.id), `Day ${day.id} is missing from navigation`)
      assert.ok(ids.has(day.id), `Day ${day.id} section is missing`)
      assert.ok(renderedText.includes(normalize(day.label)), `Day heading ${day.label} is missing`)
      assert.ok(markup.includes(`dateTime="${day.date}"`) || markup.includes(`datetime="${day.date}"`), `Day date ${day.date} needs a semantic time element`)
      for (const block of day.blocks) {
        for (const entry of block.entries ?? []) {
          if (entry.time) assert.ok(renderedText.includes(normalize(entry.time)), `Programme time ${entry.time} is missing`)
        }
      }
    }
    assert.ok((markup.match(/<h2(?:\s|>)/g)?.length ?? 0) >= dataModule.days.length, "Days need visible headings")
  })

  await context.test("mounts /agenda publicly without adding links to the existing website", async () => {
    const entry = await readFile(path.join(projectRoot, "src", "main.tsx"), "utf8")
    assert.match(entry, /path=["']\/agenda["']/)
    assert.match(entry, /import\(["']\.\/pages\/agenda\/AgendaPage\.tsx["']\)/)
    assert.ok(entry.indexOf('path="/agenda"') < entry.indexOf('path="/*"'), "The public agenda route must precede the homepage fallback")

    const homepageFiles = ["src/App.tsx", "src/components/layout/Navigation.tsx", "src/components/layout/Footer.tsx"]
    const sections = await readdir(path.join(projectRoot, "src", "components", "sections"))
    homepageFiles.push(...sections.filter(file => file.endsWith(".tsx")).map(file => `src/components/sections/${file}`))
    const homepageSources = await Promise.all(homepageFiles.map(async file => [file, await readFile(path.join(projectRoot, file), "utf8")]))
    for (const [file, source] of homepageSources) {
      assert.doesNotMatch(source, /["'`]\/agenda(?:[/?#"'`]|$)/, `${file} adds an incoming agenda link`)
    }
  })
})
