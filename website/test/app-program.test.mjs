import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { readFile } from "node:fs/promises"
import { Buffer } from "node:buffer"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

function normalize(text) {
  return text.normalize("NFC").replace(/\s+/g, " ").trim()
}

function sourceTimes(time) {
  // These are the two previously documented app corrections to printed PDF typos.
  if (time === "11:45-11:15") return ["10:45", "11:15"]
  if (time === "11:45-11:-50") return ["11:45", "11:50"]
  const match = time.match(/^(\d{2}:\d{2})(?:\s*[-–]\s*(\d{2}:\d{2}))?$/)
  assert.ok(match, `Unexpected source time: ${time}`)
  return [match[1], match[2] ?? ""]
}

function appTitle(day, block, entry) {
  if (day.id === "monday") return "ICE BREAKER"
  if (entry.title === "Welcome speeches") return "Opening: Welcome speeches & Event Opening"
  if (entry.paragraphs?.includes("Invited keynote lecture")) return `Invited keynote lecture: ${entry.title}`
  if (block.tutors && entry.kind !== "break") return `${block.title}: ${entry.title}`
  return entry.title
}

function calendarEvents(ics) {
  const unfolded = ics.replace(/\r?\n[ \t]/g, "")
  return [...unfolded.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)\r?\nEND:VEVENT/g)].map(match => {
    const fields = match[1].split("BEGIN:VALARM")[0].split(/\r?\n/).filter(line => line.includes(":"))
    return new Map(fields.map(line => {
      const colon = line.indexOf(":")
      return [line.slice(0, colon), line.slice(colon + 1)]
    }))
  })
}

function unescapeIcs(text) {
  return text.replace(/\\([nN,;\\])/g, (_, escaped) => /[nN]/.test(escaped) ? "\n" : escaped)
}

function assertUtf8Ics(ics) {
  // Check the bytes that a downloaded file contains, including the continuation space.
  const serialized = Buffer.from(ics, "utf8").toString("utf8")
  assert.equal(serialized, ics, "UTF-8 encoding must not replace a split Unicode character")
  assert.ok(serialized.endsWith("\r\n"), "The calendar must end with CRLF")
  assert.doesNotMatch(serialized.replace(/\r\n/g, ""), /[\r\n]/, "Calendar lines must use CRLF")
  const lines = serialized.split("\r\n")
  for (const line of lines) assert.ok(Buffer.byteLength(line, "utf8") <= 75, `Physical ICS line exceeds 75 UTF-8 octets: ${line}`)
  assert.ok(lines.some(line => line.startsWith(" ")), "Long source descriptions must be folded")
  return serialized
}

test("the attendee app and its calendars retain the authoritative workshop schedule", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://example.supabase.co"),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("test-publishable-key"),
    },
  })
  context.after(async () => { await vite.close() })
  const [appData, agendaData, calendar, timeFormatting, page, sourceFixture] = await Promise.all([
    vite.ssrLoadModule("/src/app/lib/program-data.ts"),
    vite.ssrLoadModule("/src/pages/agenda/agenda-data.ts"),
    vite.ssrLoadModule("/src/app/lib/calendar.ts"),
    vite.ssrLoadModule("/src/app/lib/program-time.ts"),
    vite.ssrLoadModule("/src/app/pages/Program.tsx"),
    readFile(path.join(testDirectory, "fixtures", "agenda-source.txt"), "utf8"),
  ])
  const sessions = appData.DEFAULT_PROGRAM_SESSIONS
  // Preserve the PDF transcription, allowing the approved role correction and added mayor.
  const sourceText = normalize(sourceFixture.replace(
    "Prof. Niki Evelpidou, Chair of the IAG WG Virtual trips in Geomorphology / Department of Geology and Geoenvironment, National and Kapodistrian University of Athens",
    "Prof. Niki Evelpidou, Chair of the organising committee / Department of Geology and Geoenvironment, National and Kapodistrian University of Athens",
  )).replace(
    "Vasilis Flerianos, Deputy Mayor for Culture, Municipality of Naxos and Small Cyclades",
    "Vasilis Flerianos, Deputy Mayor for Culture, Municipality of Naxos and Small Cyclades Dimitris Lianos, Mayor of Municipality of Naxos and Small Cyclades",
  )
  const rows = agendaData.days.flatMap(day => day.blocks.flatMap(block => block.entries.map(entry => ({ day, block, entry }))))
  const sessionById = id => {
    const session = sessions.find(candidate => candidate.id === id)
    assert.ok(session, `Missing app session: ${id}`)
    return session
  }

  await context.test("matches every source date, slot, title and oral author with only the documented representations", () => {
    assert.deepEqual([...new Set(sessions.map(session => session.date))].sort(), agendaData.days.map(day => day.date))
    assert.equal(new Set(sessions.map(session => session.id)).size, sessions.length, "App session IDs must remain unique")
    const matchedIds = new Set()
    for (const { day, block, entry } of rows) {
      assert.ok(sourceText.includes(normalize(entry.title)), `The canonical title must occur in the original source: ${entry.title}`)
      const [start, end] = sourceTimes(entry.time)
      const matches = sessions.filter(session => session.date === day.date && session.start_time === start)
      assert.equal(matches.length, 1, `Expected one app row at ${day.date} ${start}`)
      const session = matches[0]
      matchedIds.add(session.id)
      assert.equal(session.end_time, end, `End time changed at ${day.date} ${start}`)
      assert.equal(session.title, appTitle(day, block, entry), `Title changed at ${day.date} ${start}`)
      for (const speaker of entry.speakers ?? []) {
        assert.ok(sourceText.includes(normalize(speaker)), `The canonical author must occur in the source: ${speaker}`)
        assert.ok(normalize(session.description).includes(normalize(speaker)), `Author or affiliation missing from ${session.id}: ${speaker}`)
      }
      if (day.id === "monday") assert.ok(session.description.includes(entry.title), "The ice breaker must keep the source welcome description")
      for (const paragraph of entry.paragraphs ?? []) {
        if (day.id === "monday" || paragraph.includes(agendaData.venueUrl)) continue
        assert.ok(normalize(`${session.title} ${session.description}`).includes(normalize(paragraph)), `Source detail missing from ${session.id}: ${paragraph}`)
      }
      if (block.entries[0] === entry) {
        for (const detail of [block.chairs, block.tutors, block.description].filter(Boolean)) {
          assert.ok(sourceText.includes(normalize(detail)), `The canonical session detail must occur in the source: ${detail}`)
          assert.ok(normalize(session.description).includes(normalize(detail)), `Session detail missing from ${session.id}: ${detail}`)
        }
      }
    }
    assert.deepEqual(sessions.filter(session => !matchedIds.has(session.id)).map(session => session.id).sort(), ["mon-bus", "tue-bus", "wed-bus"], "Only the three explicit transport departures may supplement the source timetable")
  })

  await context.test("retains the remaining posters with sequential numbers after the approved withdrawal", () => {
    const posterSession = sessionById("wed-poster")
    const posters = agendaData.days.flatMap(day => day.blocks.flatMap(block => block.posters ?? []))
    const description = normalize(posterSession.description)
    assert.equal(posters.length, 10)
    assert.deepEqual(posters.map(poster => poster.number), Array.from({ length: 10 }, (_, index) => `P${index + 1}`))
    assert.doesNotMatch(posterSession.description, /A Regional Morpho-Kinematic Inventory|Onaca A\./)
    assert.deepEqual([...posterSession.description.matchAll(/\b(P\d+)\./g)].map(match => match[1]), posters.map(poster => poster.number))
    for (const [index, poster] of posters.entries()) {
      // The source keeps its original P3-P12 labels; only the online numbering changes.
      const originalNumber = `P${index + 3}`
      assert.ok(sourceText.includes(normalize(`${originalNumber}. ${poster.title}`)), `Poster title missing from original source: ${originalNumber}`)
      assert.ok(description.includes(normalize(`${poster.number}. ${poster.title} ${poster.authors}`)), `Poster title or authors changed: ${poster.number}`)
    }
  })

  await context.test("keeps corrected talks and speeches in their original stable session IDs", () => {
    const santoro = sessionById("tue-s1-5")
    assert.deepEqual([santoro.date, santoro.start_time, santoro.end_time], ["2026-10-06", "12:55", "13:10"])
    assert.equal(santoro.title, "Toward the integration of historical data in erosion modelling: the case of Badlands landscapes of Aliano (Basilicata, Southern Italy)")
    assert.ok(santoro.description.startsWith("Santoro G., Mairota P., Capolongo D., Marsico A."))
    const posazhennikova = sessionById("tue-s2-1")
    assert.deepEqual([posazhennikova.date, posazhennikova.start_time, posazhennikova.end_time], ["2026-10-06", "17:20", "17:35"])
    assert.equal(posazhennikova.title, "Debris flow release susceptibility and sediment connectivity in the Russian sector of the Greater Caucasus")
    assert.ok(posazhennikova.description.startsWith("Posazhennikova V., Golosov V. N., Kharchenko S. V."))
    assert.ok(sessionById("tue-welcome").description.includes("Dr. Mihai Micu, President of the International Association of Geomorphologists /Institute of Geography, Romanian Academy"))
    const welcome = agendaData.days.flatMap(day => day.blocks.flatMap(block => block.entries)).find(entry => entry.title === "Welcome speeches")
    const welcomeSpeeches = sessionById("tue-welcome").description.split("\n\nEvent Opening:")[0].split("\n").slice(1)
    assert.deepEqual(welcomeSpeeches, welcome.speakers, "App welcome speakers must follow the approved agenda order")
    assert.equal(welcomeSpeeches.filter(speaker => speaker === "Dimitris Lianos, Mayor of Municipality of Naxos and Small Cyclades").length, 1)
    for (const name of ["Prof. Achim A. Beylich", "Prof. Zbigniew Zwoliński"]) assert.ok(sessionById("wed-closing").description.includes(name))
  })

  const startOnly = [
    ["mon-bus", "2026-10-05", "18:45", "20261005T154500Z"],
    ["mon-icebreaker", "2026-10-05", "19:00", "20261005T160000Z"],
    ["tue-bus", "2026-10-06", "08:45", "20261006T054500Z"],
    ["tue-dinner", "2026-10-06", "19:30", "20261006T163000Z"],
    ["wed-bus", "2026-10-07", "09:10", "20261007T061000Z"],
  ]

  await context.test("uses only source departure/start times for the five events without stated ends", () => {
    assert.deepEqual(sessions.filter(session => session.end_time === "").map(session => session.id).sort(), startOnly.map(([id]) => id).sort())
    for (const [id, date, start] of startOnly) assert.deepEqual([sessionById(id).date, sessionById(id).start_time, sessionById(id).end_time], [date, start, ""])
    assert.ok(sourceText.includes("18:45"))
    assert.ok(sourceText.includes("Tuesday 6 October at 08:45"))
    assert.ok(sourceText.includes("Wednesday 7 October at 09:10"))
    assert.equal(sessionById("mon-bus").description, agendaData.transportParagraphs[0])
    for (const id of ["tue-bus", "wed-bus"]) assert.ok(normalize(sessionById(id).description).includes(normalize(agendaData.transportParagraphs[1])))
  })

  await context.test("exports start-only ICS events without invented ends and zero-duration Google requests", () => {
    for (const [id, , , utcStart] of startOnly) {
      const session = sessionById(id)
      const ics = calendar.generateSessionIcs(session)
      const [event] = calendarEvents(ics)
      assert.equal(event.get("UID"), `denuchange-${id}@denuchange.vercel.app`)
      assert.equal(event.get("DTSTART"), utcStart)
      assert.ok(!event.has("DTEND"), `ICS must not invent an end for ${id}`)
      assert.doesNotMatch(ics, /undefined|NaN|Invalid Date/)
      const google = new URL(calendar.getGoogleCalendarUrl(session))
      assert.equal(google.origin, "https://calendar.google.com")
      assert.equal(google.searchParams.get("dates"), `${utcStart}/${utcStart}`)
      assert.equal(google.searchParams.get("text"), session.title)
    }
  })

  await context.test("exports explicit UTC+3 time ranges and the corrected whole-day timetable", () => {
    const explicit = sessionById("tue-s1-5")
    const [event] = calendarEvents(calendar.generateSessionIcs(explicit))
    assert.equal(event.get("DTSTART"), "20261006T095500Z")
    assert.equal(event.get("DTEND"), "20261006T101000Z")
    assert.equal(new URL(calendar.getGoogleCalendarUrl(explicit)).searchParams.get("dates"), "20261006T095500Z/20261006T101000Z")
    const tuesday = sessions.filter(session => session.date === "2026-10-06")
    const dayEvents = calendarEvents(calendar.generateDayIcs(tuesday))
    assert.equal(dayEvents.length, tuesday.length)
    assert.deepEqual(dayEvents.map(item => item.get("UID")), tuesday.map(session => `denuchange-${session.id}@denuchange.vercel.app`))
    const byUid = new Map(dayEvents.map(item => [item.get("UID"), item]))
    const corrected = byUid.get("denuchange-tue-s1-5@denuchange.vercel.app")
    assert.equal(unescapeIcs(corrected.get("SUMMARY")), explicit.title)
    assert.ok(unescapeIcs(corrected.get("DESCRIPTION")).startsWith("Santoro G., Mairota P., Capolongo D., Marsico A."))
    const afternoon = byUid.get("denuchange-tue-s2-1@denuchange.vercel.app")
    assert.equal(afternoon.get("DTSTART"), "20261006T142000Z")
    assert.equal(afternoon.get("DTEND"), "20261006T143500Z")
    assert.ok(unescapeIcs(afternoon.get("DESCRIPTION")).startsWith("Posazhennikova V., Golosov V. N., Kharchenko S. V."))
    for (const id of ["tue-bus", "tue-dinner"]) assert.ok(!byUid.get(`denuchange-${id}@denuchange.vercel.app`).has("DTEND"))
  })

  await context.test("folds single-session and day calendars within 75 UTF-8 octets while preserving accented source text", () => {
    const expectedDescription = session => `${session.description}\n\nVenue: ${session.location}`
    for (const id of ["tue-welcome", "wed-poster"]) {
      const session = sessionById(id)
      const [event] = calendarEvents(assertUtf8Ics(calendar.generateSessionIcs(session)))
      assert.equal(unescapeIcs(event.get("SUMMARY")), session.title)
      assert.equal(unescapeIcs(event.get("DESCRIPTION")), expectedDescription(session), `Folded text changed for ${id}`)
    }
    for (const date of ["2026-10-06", "2026-10-07"]) {
      const daySessions = sessions.filter(session => session.date === date)
      const events = calendarEvents(assertUtf8Ics(calendar.generateDayIcs(daySessions)))
      assert.equal(events.length, daySessions.length)
      const byUid = new Map(events.map(event => [event.get("UID"), event]))
      const session = sessionById(date === "2026-10-06" ? "tue-welcome" : "wed-poster")
      const event = byUid.get(`denuchange-${session.id}@denuchange.vercel.app`)
      assert.equal(unescapeIcs(event.get("DESCRIPTION")), expectedDescription(session), `Day calendar changed folded text for ${session.id}`)
    }
  })

  await context.test("formats known ranges and start-only events without a dangling dash", () => {
    assert.equal(timeFormatting.formatSessionTime("09:30:00", "10:00:00"), "09:30 – 10:00")
    for (const end of ["", null, undefined]) assert.equal(timeFormatting.formatSessionTime("19:00:00", end), "19:00")
  })

  await context.test("keeps the day calendar action without a full agenda button or obsolete PDF guidance", () => {
    const markup = renderToStaticMarkup(React.createElement(page.Program))
    assert.match(markup, /Add Day to Cal/)
    assert.doesNotMatch(markup, /Full agenda|href="https:\/\/uoa-gr\.github\.io\/denuchange\/agenda\/"/)
    assert.doesNotMatch(markup, /href="[^"]*DENUCHANGE_Program\.pdf/)
    for (const announcement of appData.DEFAULT_ANNOUNCEMENTS) {
      assert.doesNotMatch(announcement.body, /download[^.]*PDF[^.]*homepage|homepage[^.]*PDF/i)
    }
  })
})
