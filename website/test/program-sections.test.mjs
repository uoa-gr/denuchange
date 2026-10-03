import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const text = markup => markup.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()

test("the app shows thematic session context above its original presentation cards", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })
  context.after(async () => { await vite.close() })
  const [grouping, component, data, agenda, calendar] = await Promise.all([
    vite.ssrLoadModule("/src/app/lib/program-sections.ts"),
    vite.ssrLoadModule("/src/app/components/ProgramSchedule.tsx"),
    vite.ssrLoadModule("/src/app/lib/program-data.ts"),
    vite.ssrLoadModule("/src/pages/agenda/agenda-data.ts"),
    vite.ssrLoadModule("/src/app/lib/calendar.ts"),
  ])
  const { groupProgramSessions } = grouping
  const sessions = data.DEFAULT_PROGRAM_SESSIONS
  const row = (id, title, description = "", extra = {}) => ({
    ...sessions[0], id, date: "2026-10-06", start_time: "11:00", end_time: "11:15", title, description, session_type: "session", ...extra,
  })

  await context.test("matches all four source headings, subtitles, chairs and discussion boundaries", () => {
    const sections = groupProgramSessions(sessions)
    const themed = sections.filter(section => section.heading)
    const expected = agenda.days.flatMap(day => day.blocks.filter(block => /^Session\s/.test(block.title ?? "")).map(block => ({ day, block })))
    assert.equal(themed.length, 4)
    for (const [index, { day, block }] of expected.entries()) {
      const section = themed[index]
      assert.equal(section.heading.date, day.date)
      assert.equal(`${section.heading.label}: ${section.heading.title}`, block.title)
      assert.equal(section.heading.subtitle, block.subtitle)
      assert.equal(`Chairs: ${section.heading.chairs}`, block.chairs)
      assert.equal(section.items.length, block.entries.length)
      assert.equal(section.items.at(-1).session.title, "Discussion")
      assert.equal(section.items[0].session.start_time, block.entries[0].time.slice(0, 5))
      assert.equal(section.items.at(-1).session.end_time, block.entries.at(-1).time.slice(-5))
      for (const item of section.items) {
        assert.doesNotMatch(item.displayedDescription, /^\s*(?:Session\s+[^:]+|Chairs):/m)
      }
    }
    assert.deepEqual(sections.flatMap(section => section.items.map(item => item.session)), sessions, "Grouping must preserve every original row in order")
    for (const section of sections.filter(section => !section.heading)) {
      for (const item of section.items) assert.equal(item.displayedDescription, item.session.description)
    }
  })

  await context.test("collects Unicode metadata across arbitrary IDs and removes only metadata lines", () => {
    const source = [
      row("a771a0d4-f70e-469d-9872-7182b0972b56", "First talk", "Święchowicz J.\r\nΑγάπη Ν.\r\n\r\nSession 12A: Δυναμική ακτών\r\n\r\nMethods note."),
      row("different-db-uuid", "Second talk", "Zoë García\n\nSession 12A: Δυναμική ακτών (Παρατήρηση (2026) και αλλαγή)\nChairs: Νίκη Ευελπίδου, Zoë García"),
      row("discussion-uuid", "Discussion"),
      row("next-day-uuid", "Next day talk", "New author\nSession 12A: Another theme\nChairs: Another chair", { date: "2026-10-07" }),
    ].map(session => Object.freeze(session))
    const before = JSON.stringify(source)
    const sections = groupProgramSessions(Object.freeze(source))
    assert.equal(sections.length, 2, "Session labels are scoped to their day")
    assert.equal(sections[0].heading.label, "Session 12A")
    assert.equal(sections[0].heading.title, "Δυναμική ακτών")
    assert.equal(sections[0].heading.subtitle, "Παρατήρηση (2026) και αλλαγή")
    assert.equal(sections[0].heading.chairs, "Νίκη Ευελπίδου, Zoë García")
    assert.equal(sections[0].items.length, 3)
    assert.equal(sections[0].items[0].displayedDescription.replace(/\r\n/g, "\n"), "Święchowicz J.\nΑγάπη Ν.\n\nMethods note.")
    assert.equal(sections[0].items[1].displayedDescription, "Zoë García")
    assert.equal(sections[1].heading.title, "Another theme")
    assert.equal(JSON.stringify(source), before, "Metadata extraction must not mutate frozen source rows")
    assert.equal(sections[0].items[0].session, source[0], "Calendar actions must receive the original object")
    const nullable = row("nullable-db-id", "No description", null)
    assert.equal(groupProgramSessions([nullable])[0].items[0].displayedDescription, "")
    assert.equal(nullable.description, null, "Nullable database descriptions must remain unchanged")
  })

  await context.test("standalone breaks, meals, keynotes and untagged content interrupt inheritance", () => {
    const welcome = "Welcome speeches:\nProf. Niki Evelpidou, Chair of the IAG WG Virtual trips in Geomorphology\nEvent Opening:\nProf. Efstathios Efstathopoulos"
    const tutors = "A hands-on laboratory.\nTutors: Niki Evelpidou, Anna Karkani\nBring your device."
    const source = [
      row("welcome", "Welcome speeches", welcome),
      row("talk-1", "First talk", "Author\nSession 5: Future session (Future subtitle)\nChairs: Future chair"),
      row("discussion-1", "Discussion"),
      row("coffee", "Coffee break", "", { session_type: "break" }),
      row("discussion-after-break", "Discussion"),
      row("keynote", "Invited keynote", "Keynote author", { session_type: "keynote" }),
      row("talk-2", "Second talk", "Author two\nSession 5: Future session"),
      row("discussion-2", "Discussion"),
      row("lunch", "Light Lunch", "", { session_type: "meal" }),
      row("vft", "VFT Laboratory", tutors),
    ]
    const sections = groupProgramSessions(source)
    const themed = sections.filter(section => section.heading)
    assert.deepEqual(themed.map(section => section.items.map(item => item.session.id)), [["talk-1", "discussion-1"], ["talk-2", "discussion-2"]])
    assert.equal(themed[0].heading.key, themed[1].heading.key, "Interrupted runs keep the same session metadata")
    assert.equal(themed[1].heading.chairs, "Future chair")
    const standalone = sections.filter(section => !section.heading).flatMap(section => section.items)
    assert.deepEqual(standalone.map(item => item.session.id), ["welcome", "coffee", "discussion-after-break", "keynote", "lunch", "vft"])
    assert.equal(standalone.find(item => item.session.id === "welcome").displayedDescription, welcome)
    assert.equal(standalone.find(item => item.session.id === "vft").displayedDescription, tutors)
    assert.deepEqual(sections.flatMap(section => section.items.map(item => item.session)), source)
  })

  await context.test("renders chairs in labelled section headers while retaining original calendar links", () => {
    for (const date of ["2026-10-06", "2026-10-07"]) {
      const daySessions = sessions.filter(session => session.date === date)
      const markup = renderToStaticMarkup(React.createElement(component.ProgramSchedule, { sessions: daySessions, remindedId: null, onAddReminder() {} }))
      const sections = groupProgramSessions(daySessions).filter(section => section.heading)
      assert.equal(markup.match(/<section\b/g)?.length, 2)
      assert.equal(markup.match(/<article\b/g)?.length, daySessions.length)
      const renderedSections = [...markup.matchAll(/<section[^>]*aria-labelledby="([^"]+)"[^>]*><header\b[^>]*>([\s\S]*?)<\/header>/g)]
      for (const [index, section] of sections.entries()) {
        const first = section.items[0].session
        const sectionMarkup = renderedSections[index]
        assert.ok(sectionMarkup, "The thematic section must have a labelled header")
        const headingId = sectionMarkup[1]
        assert.ok(sectionMarkup[2].includes(`id="${headingId}"`))
        assert.ok(text(sectionMarkup[2]).includes(section.heading.label))
        assert.ok(text(sectionMarkup[2]).includes(section.heading.title))
        assert.ok(text(sectionMarkup[2]).includes(section.heading.subtitle))
        assert.ok(text(sectionMarkup[2]).includes(`Chairs: ${section.heading.chairs}`))
        assert.ok(markup.includes(section.heading.chairs))
        const article = markup.match(new RegExp(`<article[^>]*data-program-session-id="${first.id}"[^>]*>[\\s\\S]*?<\\/article>`))?.[0]
        assert.ok(article, "The first presentation must remain an individual article")
        assert.doesNotMatch(text(article), /Chairs:|Session \d+:/)
        assert.ok(article.includes(first.title.replace(/&/g, "&amp;")))
        const expectedUrl = calendar.getGoogleCalendarUrl(first).replace(/&/g, "&amp;")
        assert.ok(article.includes(`href="${expectedUrl}"`), "Google Calendar must retain the original complete description")
        assert.equal(text(markup).split(section.heading.chairs).length - 1, 1, "Chair names belong in the header once")
      }
    }
  })
})
