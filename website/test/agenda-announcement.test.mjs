import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const normalize = text => text.normalize("NFC").replace(/\s+/g, " ").trim()

function timeRange(text) {
  const match = text.match(/(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})/u)
  assert.ok(match, `An explicit time range is required: ${text}`)
  return [match[1], match[2]]
}

function noticeAfterName(body, name) {
  const position = body.indexOf(normalize(name))
  assert.ok(position >= 0, `The notice must identify ${name}`)
  return body.slice(position + normalize(name).length)
}

test("the latest agenda announcement communicates the authoritative program changes", async context => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })
  context.after(async () => { await vite.close() })
  const [app, agenda] = await Promise.all([
    vite.ssrLoadModule("/src/app/lib/program-data.ts"),
    vite.ssrLoadModule("/src/pages/agenda/agenda-data.ts"),
  ])
  const noticeId = "alert-agenda-update-20261003"
  const notice = app.DEFAULT_ANNOUNCEMENTS.find(item => item.id === noticeId)
  assert.ok(notice, "Attendees must receive an announcement for the October agenda update")
  const body = normalize(notice.body)
  const rows = agenda.days.flatMap(day => day.blocks.flatMap(block =>
    block.entries.map(entry => ({ day, block, entry }))))
  const sessionById = id => {
    const session = app.DEFAULT_PROGRAM_SESSIONS.find(item => item.id === id)
    assert.ok(session, `The app program must retain ${id}`)
    return session
  }

  await context.test("publishes one dated update ahead of the earlier announcements", () => {
    assert.equal(app.DEFAULT_ANNOUNCEMENTS.filter(item => item.id === noticeId).length, 1)
    assert.equal(app.DEFAULT_ANNOUNCEMENTS[0], notice)
    const published = Date.parse(notice.created_at)
    assert.ok(Number.isFinite(published), "The notice needs a valid publication time")
    assert.equal(new Date(published).toISOString().slice(0, 10), "2026-10-03")
    for (const earlier of app.DEFAULT_ANNOUNCEMENTS.filter(item => item !== notice)) {
      assert.ok(published > Date.parse(earlier.created_at), "The October update must sort after the existing announcements")
    }
  })

  await context.test("associates each moved presentation with its correct time and thematic session", () => {
    for (const [id, leadAuthor] of [["tue-s1-5", "Santoro G."], ["tue-s2-1", "Posazhennikova V."]]) {
      const matches = rows.filter(row => row.entry.speakers?.some(speaker => normalize(speaker).startsWith(leadAuthor)))
      assert.equal(matches.length, 1, `Expected one authoritative presentation for ${leadAuthor}`)
      const { day, block, entry } = matches[0]
      const session = sessionById(id)
      const expectedTimes = timeRange(entry.time)
      assert.equal(session.date, day.date)
      assert.deepEqual([session.start_time, session.end_time], expectedTimes)
      assert.equal(normalize(session.title), normalize(entry.title))
      assert.ok(normalize(session.description).startsWith(leadAuthor))
      assert.ok(body.includes(day.label.replace(/\s+\d{4}$/u, "")), "The notice must identify the correct Tuesday")

      const statement = noticeAfterName(body, leadAuthor)
      const actualTimes = timeRange(statement)
      assert.deepEqual(actualTimes, expectedTimes, `The notice has the wrong presentation time for ${leadAuthor}`)
      const statedSession = statement.match(/\bSession\s+\d+\b/u)?.[0]
      const expectedSession = block.title.match(/^Session\s+\d+\b/u)?.[0]
      assert.ok(expectedSession, "The source presentation must belong to a thematic session")
      assert.equal(statedSession, expectedSession, `The notice has the wrong session for ${leadAuthor}`)
    }
  })

  await context.test("identifies the added welcome and closing speakers at their source times", () => {
    const welcome = rows.find(row => row.entry.title === "Welcome speeches")
    const closing = rows.find(row => row.entry.title === "Closing remarks")
    assert.ok(welcome)
    assert.ok(closing)
    const welcomeSession = sessionById("tue-welcome")
    const closingSession = sessionById("wed-closing")
    for (const [row, session] of [[welcome, welcomeSession], [closing, closingSession]]) {
      assert.equal(session.date, row.day.date)
      assert.deepEqual([session.start_time, session.end_time], timeRange(row.entry.time))
    }

    const micu = welcome.entry.speakers.find(speaker => speaker.startsWith("Dr. Mihai Micu,"))
    assert.ok(micu, "The official welcome speeches must include Dr. Mihai Micu")
    assert.ok(welcomeSession.description.includes(micu))
    assert.deepEqual(timeRange(noticeAfterName(body, micu.split(",")[0])), timeRange(welcome.entry.time))

    assert.ok(body.includes(closing.day.label.split(",")[0]), "The closing remarks must be identified as Wednesday's")
    for (const speaker of closing.entry.speakers) {
      assert.ok(closingSession.description.includes(speaker), "Closing speaker affiliations must remain in the app")
      assert.deepEqual(timeRange(noticeAfterName(body, speaker.split(",")[0])), timeRange(closing.entry.time))
    }
  })

  await context.test("the claim that all session chairs are listed is supported by both schedules", () => {
    assert.match(body, /\ball session chairs\b/iu)
    const thematicBlocks = agenda.days.flatMap(day => day.blocks.filter(block => /^Session\s+\d+:/u.test(block.title ?? "")))
    assert.equal(thematicBlocks.length, 4)
    for (const block of thematicBlocks) {
      assert.ok(block.chairs, `${block.title} must name its chairs`)
      const firstTalk = app.DEFAULT_PROGRAM_SESSIONS.find(session => normalize(session.title) === normalize(block.entries[0].title))
      assert.ok(firstTalk, `The app must include ${block.title}`)
      assert.ok(firstTalk.description.includes(block.chairs), `The app must retain the source chair names for ${block.title}`)
    }
  })
})
