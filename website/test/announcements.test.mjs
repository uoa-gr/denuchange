import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const announcement = (id, title, created_at, body = title) => ({ id, title, body, created_at })

test("bundled and published announcements form one current feed", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })
  context.after(async () => { await vite.close() })
  const { mergeAnnouncements } = await vite.ssrLoadModule("/src/app/lib/announcements.ts")

  await context.test("a bundled update stays latest when the database contains only older notices", () => {
    const published = [announcement("db-old", "Previous logistics", "2026-09-29T10:00:00Z")]
    const bundled = [
      announcement("default-old", "Earlier agenda", "2026-09-27T19:00:00Z"),
      announcement("default-new", "New agenda", "2026-10-02T15:00:00Z"),
    ]
    const result = mergeAnnouncements(published, bundled)
    assert.deepEqual(result.map(item => item.id), ["default-new", "db-old", "default-old"])
    assert.equal(result[0].title, "New agenda", "The home preview must use the newest item in the merged feed")
  })

  await context.test("a later live notice outranks the bundled update using actual instants across time zones", () => {
    const bundled = [announcement("agenda", "Agenda update", "2026-10-02T15:00:00Z")]
    const published = [
      announcement("before", "Earlier local-time notice", "2026-10-02T17:30:00+03:00"),
      announcement("after", "Venue change", "2026-10-02T19:00:00+03:00"),
    ]
    assert.deepEqual(mergeAnnouncements(published, bundled).map(item => item.id), ["after", "agenda", "before"])
  })

  await context.test("duplicate IDs retain the newest content regardless of its source", () => {
    const published = [
      announcement("same-a", "Old published title", "2026-09-28T10:00:00Z", "Old published body"),
      announcement("same-b", "Corrected live title", "2026-10-03T10:00:00Z", "Corrected live body"),
    ]
    const bundled = [
      announcement("same-a", "Corrected bundled title", "2026-10-02T10:00:00Z", "Corrected bundled body"),
      announcement("same-b", "Old bundled title", "2026-09-27T10:00:00Z", "Old bundled body"),
    ]
    const result = mergeAnnouncements(published, bundled)
    assert.deepEqual(result.map(item => [item.id, item.title, item.body]), [
      ["same-b", "Corrected live title", "Corrected live body"],
      ["same-a", "Corrected bundled title", "Corrected bundled body"],
    ])
  })

  await context.test("duplicate titles retain the newer body and published IDs win exact date ties", () => {
    const published = [
      announcement("published-old", "Agenda update", "2026-09-28T10:00:00Z", "Old content"),
      announcement("published-tie", "Transport update", "2026-10-02T12:00:00Z", "Live content"),
    ]
    const bundled = [
      announcement("bundled-new", "Agenda update", "2026-10-02T13:00:00Z", "Corrected content"),
      announcement("bundled-tie", "Transport update", "2026-10-02T15:00:00+03:00", "Bundled content"),
    ]
    assert.deepEqual(mergeAnnouncements(published, bundled).map(item => [item.id, item.body]), [
      ["bundled-new", "Corrected content"], ["published-tie", "Live content"],
    ])
  })

  await context.test("repeated realtime inserts are deduplicated and placed in chronological order", () => {
    const bundled = [announcement("agenda", "Agenda update", "2026-10-02T15:00:00Z")]
    const initial = mergeAnnouncements([announcement("old", "Prior notice", "2026-09-29T10:00:00Z")], bundled)
    const newest = announcement("live", "Bus update", "2026-10-03T08:00:00Z")
    const once = mergeAnnouncements([newest, ...initial], bundled)
    const twice = mergeAnnouncements([newest, ...once], bundled)
    assert.deepEqual(twice.map(item => item.id), ["live", "agenda", "old"])
    const delayed = announcement("delayed", "Delayed delivery", "2026-10-01T08:00:00Z")
    assert.deepEqual(mergeAnnouncements([delayed, ...twice], bundled).map(item => item.id), ["live", "agenda", "delayed", "old"])
  })

  await context.test("empty reads retain sorted defaults and frozen input records remain intact", () => {
    const first = Object.freeze(announcement("old", "Old notice", "2026-09-27T10:00:00Z"))
    const second = Object.freeze(announcement("new", "New notice", "2026-10-02T10:00:00Z"))
    const malformed = Object.freeze(announcement("invalid", "Missing date", "not-a-date"))
    const bundled = Object.freeze([first, second, malformed])
    const result = mergeAnnouncements(Object.freeze([]), bundled)
    assert.deepEqual(result.map(item => item.id), ["new", "old", "invalid"])
    assert.equal(result[0], second, "The original notification object carries its read identity")
    assert.deepEqual(bundled.map(item => item.id), ["old", "new", "invalid"])
    assert.deepEqual(mergeAnnouncements([], []), [])
  })
})
