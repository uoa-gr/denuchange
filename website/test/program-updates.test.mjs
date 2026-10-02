import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const settle = () => new Promise(resolve => setImmediate(resolve))

function fakeTarget() {
  const listeners = new Map()
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type).add(listener)
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener) },
    dispatch(type) { for (const listener of listeners.get(type) ?? []) listener() },
    listenerCount() { return [...listeners.values()].reduce((total, callbacks) => total + callbacks.size, 0) },
  }
}

function harness(startProgramUpdates, { visible = true, online = true } = {}) {
  const intervals = new Map()
  let timerId = 0
  const environment = {
    window: {
      ...fakeTarget(),
      setInterval(callback, delay) { intervals.set(++timerId, { callback, delay }); return timerId },
      clearInterval(id) { intervals.delete(id) },
    },
    document: { ...fakeTarget(), visibilityState: visible ? "visible" : "hidden" },
    navigator: { onLine: online },
  }
  const reads = []
  const published = []
  let ready = 0
  const stop = startProgramUpdates({
    loadSessions: () => new Promise((resolve, reject) => { reads.push({ resolve, reject }) }),
    onSessions: sessions => { published.push(sessions) },
    onReady: () => { ready += 1 },
  }, environment)
  return {
    environment, reads, published, intervals, stop,
    ready: () => ready,
    poll: () => { for (const interval of [...intervals.values()]) interval.callback() },
  }
}

test("an open Program view refreshes its schedule without losing usable data", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })
  context.after(async () => { await vite.close() })
  const [{ startProgramUpdates }, { DEFAULT_PROGRAM_SESSIONS }] = await Promise.all([
    vite.ssrLoadModule("/src/app/lib/program-updates.ts"),
    vite.ssrLoadModule("/src/app/lib/program-data.ts"),
  ])
  const initialSchedule = [{ ...DEFAULT_PROGRAM_SESSIONS.find(session => session.id === "tue-reg"), description: "Initial server schedule" }]
  const updatedSchedule = [{ ...initialSchedule[0], description: "Updated server schedule" }]

  await context.test("loads initially and refreshes on visible polling, resume and reconnect", async (subtest) => {
    const state = harness(startProgramUpdates, { visible: false, online: false })
    subtest.after(state.stop)
    assert.equal(state.reads.length, 1, "Initial load must run even before the client becomes online or visible")
    assert.equal(state.intervals.size, 1)
    assert.equal([...state.intervals.values()][0].delay, 60_000)
    state.reads[0].resolve(initialSchedule)
    await settle()
    assert.equal(state.published[0], initialSchedule)
    assert.equal(state.ready(), 1)

    state.environment.window.dispatch("focus")
    state.environment.window.dispatch("online")
    state.poll()
    assert.equal(state.reads.length, 1, "Hidden or offline clients must not keep polling")
    state.environment.document.visibilityState = "visible"
    state.environment.document.dispatch("visibilitychange")
    assert.equal(state.reads.length, 1, "A visible but offline client must wait for connectivity")
    state.environment.navigator.onLine = true
    state.environment.window.dispatch("online")
    assert.equal(state.reads.length, 2)
    state.reads[1].resolve(updatedSchedule)
    await settle()
    assert.equal(state.published.at(-1), updatedSchedule)

    state.environment.window.dispatch("focus")
    assert.equal(state.reads.length, 3)
    state.reads[2].resolve(updatedSchedule)
    await settle()
    state.environment.document.visibilityState = "hidden"
    state.environment.document.dispatch("visibilitychange")
    state.poll()
    assert.equal(state.reads.length, 3)
    state.environment.document.visibilityState = "visible"
    state.environment.document.dispatch("visibilitychange")
    assert.equal(state.reads.length, 4)
    state.reads[3].resolve(updatedSchedule)
    await settle()
    state.poll()
    assert.equal(state.reads.length, 5)
    state.reads[4].resolve(updatedSchedule)
    await settle()
    assert.equal(state.ready(), 1, "Refreshes must not reset the initial loading state")
  })

  await context.test("deduplicates simultaneous focus, reconnect and timer reads", async (subtest) => {
    const state = harness(startProgramUpdates)
    subtest.after(state.stop)
    state.environment.window.dispatch("focus")
    state.environment.window.dispatch("online")
    state.environment.document.dispatch("visibilitychange")
    state.poll()
    assert.equal(state.reads.length, 1, "The initial pending request must absorb concurrent refresh triggers")
    state.reads[0].resolve(initialSchedule)
    await settle()
    state.poll()
    state.poll()
    state.environment.window.dispatch("focus")
    assert.equal(state.reads.length, 2, "Only one later request may remain in flight")
    state.reads[1].resolve(updatedSchedule)
    await settle()
    assert.deepEqual(state.published, [initialSchedule, updatedSchedule])
    assert.equal(state.ready(), 1)
  })

  await context.test("falls back on initial failure or empty results and preserves the last schedule on later failure", async (subtest) => {
    const state = harness(startProgramUpdates)
    subtest.after(state.stop)
    state.reads[0].reject(new Error("Initial request unavailable"))
    await settle()
    assert.equal(state.published[0], DEFAULT_PROGRAM_SESSIONS)
    assert.equal(state.ready(), 1)
    state.environment.window.dispatch("online")
    state.reads[1].resolve(updatedSchedule)
    await settle()
    assert.equal(state.published.at(-1), updatedSchedule)
    state.environment.window.dispatch("focus")
    state.reads[2].reject(new Error("Refresh unavailable"))
    await settle()
    assert.equal(state.published.length, 2, "A later failure must not overwrite a usable schedule")
    assert.equal(state.published.at(-1), updatedSchedule)
    state.poll()
    state.reads[3].resolve([])
    await settle()
    assert.equal(state.published.at(-1), DEFAULT_PROGRAM_SESSIONS, "A successful empty response uses the verified defaults")
    assert.equal(state.ready(), 1)
  })

  await context.test("cleans up listeners and polling and ignores late success or failure", async () => {
    for (const fail of [false, true]) {
      const state = harness(startProgramUpdates)
      assert.equal(state.environment.window.listenerCount(), 2)
      assert.equal(state.environment.document.listenerCount(), 1)
      state.stop()
      assert.equal(state.intervals.size, 0)
      assert.equal(state.environment.window.listenerCount(), 0)
      assert.equal(state.environment.document.listenerCount(), 0)
      state.environment.window.dispatch("focus")
      state.environment.window.dispatch("online")
      state.environment.document.dispatch("visibilitychange")
      state.poll()
      assert.equal(state.reads.length, 1)
      if (fail) state.reads[0].reject(new Error("Response after unmount"))
      else state.reads[0].resolve(updatedSchedule)
      await settle()
      assert.equal(state.published.length, 0, "An unmounted view must ignore late data and fallback")
      assert.equal(state.ready(), 0)
    }
    const state = harness(startProgramUpdates)
    state.reads[0].resolve(initialSchedule)
    await settle()
    state.environment.window.dispatch("focus")
    state.stop()
    state.reads[1].resolve(updatedSchedule)
    await settle()
    assert.deepEqual(state.published, [initialSchedule], "Unmounting during a refresh must preserve the last delivered schedule")
    assert.equal(state.ready(), 1)
  })
})
