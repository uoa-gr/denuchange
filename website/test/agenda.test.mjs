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

function disclosures(markup) {
  const result = []
  const stack = []
  const sectionStack = []
  for (const token of markup.matchAll(/<section\b([^>]*)>|<\/section>|<details\b([^>]*)>|<\/details>|<summary\b[^>]*>([\s\S]*?)<\/summary>/g)) {
    if (token[1] !== undefined) {
      sectionStack.push(token[1].match(/\bid="([^"]+)"/)?.[1])
    } else if (token[0] === "</section>") {
      sectionStack.pop()
    } else if (token[2] !== undefined) {
      const disclosure = {
        attributes: token[2],
        id: token[2].match(/\bid="([^"]+)"/)?.[1] ?? sectionStack.at(-1),
        depth: stack.length,
        summaries: [],
      }
      result.push(disclosure)
      stack.push(disclosure)
    } else if (token[3] !== undefined) {
      assert.ok(stack.length, "A disclosure summary must belong to a details element")
      stack.at(-1).summaries.push(normalize(visibleText(token[3])))
    } else {
      assert.ok(stack.length, "A details closing tag must match a disclosure")
      stack.pop()
    }
  }
  assert.equal(stack.length, 0, "Native disclosures must have balanced markup")
  return result
}

test("the public agenda preserves the approved programme and public routing", async (context) => {
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
  const mainContent = markup.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ""

  await context.test("renders every source paragraph, including authors and committees", () => {
    // Preserve the PDF transcription, allowing the explicitly approved welcome-role correction.
    const approvedNikiWelcome = "Prof. Niki Evelpidou, Chair of the organising committee / Department of Geology and Geoenvironment, National and Kapodistrian University of Athens"
    const approvedSource = sourceFixture.replace(
      "Prof. Niki Evelpidou, Chair of the IAG WG Virtual trips in Geomorphology / Department of Geology and Geoenvironment, National and Kapodistrian University of Athens",
      approvedNikiWelcome,
    )
    const welcome = dataModule.days.flatMap(day => day.blocks.flatMap(block => block.entries)).find(entry => entry.title === "Welcome speeches")
    assert.equal(welcome.speakers[0], approvedNikiWelcome, "The organising committee chair must remain the first welcome speaker")
    const removedPreface = "The workshop is preceded by an ice breaker event on Monday, 5 October (see p. 3)"
    const fragments = approvedSource.split(/\r?\n\s*\r?\n/)
      .map(normalize)
      .filter(fragment => fragment && fragment !== removedPreface)
      .map(fragment => fragment.replace(` (${dataModule.busStationUrl})`, "").replace(dataModule.venueUrl, "Open venue map"))
    const missing = fragments.filter(fragment => !renderedText.includes(fragment))
    assert.deepEqual(missing, [], "Source programme content is missing or changed")
    assert.doesNotMatch(renderedText, /\(see p\. \d+\)/, "PDF page references do not belong in the web programme")
    assert.ok(markup.includes(`href="${dataModule.busStationUrl}"`), "The bus station map must retain its source destination")
    assert.ok(markup.includes(`href="${dataModule.venueUrl}"`), "Venue map buttons must retain their source destination")
    assert.ok(!renderedText.includes(dataModule.venueUrl), "Venue maps should use descriptive buttons instead of visible URLs")
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

  await context.test("provides semantic day sections and reachable in-page links", () => {
    assert.equal(markup.match(/<main(?:\s|>)/g)?.length, 1)
    assert.equal(markup.match(/<h1(?:\s|>)/g)?.length, 1)
    const allIds = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
    const ids = new Set(allIds)
    assert.equal(ids.size, allIds.length, "Every page anchor must have a unique ID")
    const anchors = [...markup.matchAll(/href="#([^"]+)"/g)].map(match => match[1])
    for (const anchor of anchors) assert.ok(ids.has(anchor), `In-page link #${anchor} has no destination`)
    for (const day of dataModule.days) {
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

  await context.test("offers labeled native disclosures with readable top-level sections by default", () => {
    const sections = disclosures(mainContent)
    assert.ok(sections.length >= dataModule.days.length + 2, "The days, organizers and venue need native disclosures")
    for (const section of sections) {
      assert.equal(section.summaries.length, 1, "Each disclosure needs one direct summary control")
      assert.ok(section.summaries[0].length > 0, "Disclosure controls need readable labels")
      if (section.depth === 0) assert.match(section.attributes, /\bopen(?:\s|=|$)/, "Top-level content should be expanded initially")
    }
    const requiredLabels = ["Organizing bodies", "Workshop Venue", ...dataModule.days.map(day => day.label)]
    for (const label of requiredLabels) {
      assert.ok(sections.some(section => section.summaries[0].includes(normalize(label))), `${label} needs a labeled native disclosure`)
    }
  })

  await context.test("provides sidebar contents with reachable links to every day and titled programme section", () => {
    const sidebar = markup.match(/<nav\b[^>]*aria-label="Agenda sections"[^>]*>([\s\S]*?)<\/nav>/)
    assert.ok(sidebar, "The programme needs a labeled Agenda sections navigation landmark")
    const links = [...sidebar[1].matchAll(/<a\b[^>]*href="#([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    const targets = new Set(links.map(link => link[1]))
    const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
    for (const link of links) {
      assert.ok(normalize(visibleText(link[2])).length > 0, `Section link #${link[1]} needs a readable label`)
      assert.ok(ids.has(link[1]), `Section link #${link[1]} has no destination`)
    }
    for (const id of ["agenda-organizers", "agenda-venue", ...dataModule.days.map(day => day.id)]) {
      assert.ok(targets.has(id), `The table of contents needs a link to #${id}`)
    }
    const sections = disclosures(mainContent)
    for (const block of dataModule.days.flatMap(day => day.blocks).filter(block => block.title)) {
      const section = sections.find(candidate => candidate.summaries[0]?.includes(normalize(block.title)))
      assert.ok(section, `${block.title} needs a labeled disclosure`)
      assert.ok(section.id && targets.has(section.id), `${block.title} needs a table-of-contents destination`)
    }
  })

  await context.test("mounts /agenda publicly and keeps homepage links within the approved sections", async () => {
    const entry = await readFile(path.join(projectRoot, "src", "main.tsx"), "utf8")
    assert.match(entry, /path=["']\/agenda["']/)
    assert.match(entry, /import\(["']\.\/pages\/agenda\/AgendaPage\.tsx["']\)/)
    assert.ok(entry.indexOf('path="/agenda"') < entry.indexOf('path="/*"'), "The public agenda route must precede the homepage fallback")

    const homepageFiles = ["src/App.tsx", "src/components/layout/Navigation.tsx", "src/components/layout/Footer.tsx"]
    const sections = await readdir(path.join(projectRoot, "src", "components", "sections"))
    homepageFiles.push(...sections.filter(file => file.endsWith(".tsx")).map(file => `src/components/sections/${file}`))
    const homepageSources = await Promise.all(homepageFiles.map(async file => [file, await readFile(path.join(projectRoot, file), "utf8")]))
    const approvedSections = new Set(["src/components/sections/Hero.tsx", "src/components/sections/Program.tsx"])
    const publishedAgendaUrl = "https://uoa-gr.github.io/denuchange/agenda/"
    for (const [file, source] of homepageSources) {
      const agendaReferences = [...source.matchAll(/(["'`])([^"'`\r\n]+)\1/g)]
        .map(match => match[2])
        .filter(value => /\/agenda(?:[/?#]|$)/.test(value))
      for (const reference of agendaReferences) {
        assert.ok(approvedSections.has(file), `${file} adds an unsolicited incoming agenda link`)
        assert.equal(reference, publishedAgendaUrl, `${file} should link to the published agenda URL`)
      }
    }
  })
})
