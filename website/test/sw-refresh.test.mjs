import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { runInNewContext } from "node:vm"

const source = readFileSync(new URL("../public/sw-refresh.js", import.meta.url), "utf8")
const settle = () => new Promise(resolve => setImmediate(resolve))
const readyMessage = "DENUCHANGE_CLIENT_READY"

function harness({ scope = "https://denuchange.vercel.app/", origin = "https://denuchange.vercel.app", clients = [], channels = true, claimPromise } = {}) {
  const listeners = new Map()
  const timers = new Map()
  const actions = []
  const navigations = []
  const messages = []
  const ports = []
  let timerId = 0

  class FakeMessageChannel {
    constructor() {
      this.port1 = { closed: false, close() { this.closed = true }, onmessage: undefined }
      const receivingPort = this.port1
      this.port2 = {
        closed: false,
        close() { this.closed = true },
        postMessage(data) { receivingPort.onmessage?.({ data }) },
      }
      ports.push(this.port1, this.port2)
    }
  }

  const windows = clients.map((entry, index) => {
    const definition = typeof entry === "string" ? { url: entry } : entry
    return {
      id: `client-${index}`,
      url: definition.url,
      type: definition.type ?? "window",
      frameType: definition.frameType ?? "top-level",
      postMessage(message, transferredPorts) {
        messages.push({ url: definition.url, type: message.type })
        if (definition.messageThrows) throw new Error("Client has gone away")
        if (definition.ready) transferredPorts[0].postMessage({ type: readyMessage })
        if (definition.invalidReply) transferredPorts[0].postMessage({ type: "UNRELATED_MESSAGE" })
      },
      navigate(target) {
        navigations.push({ from: definition.url, to: target })
        if (definition.navigationThrows) throw new Error("The tab closed")
        if (definition.navigationRejects) return Promise.reject(new Error("The tab closed"))
        if (definition.navigationPending) return new Promise(() => {})
        return Promise.resolve()
      },
    }
  })

  const worker = {
    location: new URL(`${origin}/sw.js`),
    registration: { scope },
    clients: {
      async claim() { actions.push("claim"); await claimPromise },
      async matchAll(options) {
        assert.equal(options.type, "window")
        assert.equal(options.includeUncontrolled, true)
        actions.push("matchAll")
        return windows
      },
    },
    addEventListener(type, listener) { listeners.set(type, listener) },
    setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId },
    clearTimeout(id) { timers.delete(id) },
  }
  const forbiddenCaches = new Proxy({}, { get() { throw new Error("Recovery must preserve offline caches") } })
  runInNewContext(source, {
    self: worker,
    URL,
    MessageChannel: channels ? FakeMessageChannel : undefined,
    caches: forbiddenCaches,
  }, { timeout: 1000 })

  return {
    listeners, timers, actions, navigations, messages, ports,
    activate() {
      const pending = []
      listeners.get("activate")({ waitUntil(promise) { pending.push(promise) } })
      assert.equal(pending.length, 1, "The worker must retain its claim and recovery checks during activation")
      return Promise.all(pending)
    },
    expireReadinessChecks() {
      for (const [id, timer] of [...timers]) {
        timers.delete(id)
        assert.equal(timer.delay, 700)
        timer.callback()
      }
    },
  }
}

test("legacy tabs recover without any current bootstrap or reload listener", async () => {
  const urls = [
    "https://denuchange.vercel.app/",
    "https://denuchange.vercel.app/agenda?layout=compact#wednesday-block-2",
    "https://denuchange.vercel.app/app/program?day=2026-10-06#session-2",
    "https://denuchange.vercel.app/app/auth/login?next=%2Fapp%2Fprogram",
  ]
  const state = harness({ clients: urls })
  const activation = state.activate()
  await settle()
  assert.deepEqual(state.actions, ["claim", "matchAll"])
  assert.equal(state.navigations.length, 0, "Give current bootstrap clients a chance to acknowledge")
  state.expireReadinessChecks()
  await activation
  assert.deepEqual(state.navigations, urls.map(url => ({ from: url, to: url })))
  assert.ok(state.ports.every(port => port.closed))
})

test("current clients acknowledge readiness and avoid duplicate or first-install navigation", async () => {
  const state = harness({ clients: [
    { url: "https://denuchange.vercel.app/", ready: true },
    { url: "https://denuchange.vercel.app/app/program", ready: true },
  ] })
  await state.activate()
  assert.deepEqual(state.messages.map(message => message.type), [readyMessage, readyMessage])
  assert.equal(state.timers.size, 0)
  assert.deepEqual(state.navigations, [])
  assert.ok(state.ports.every(port => port.closed))
})

test("legacy recovery waits for the new worker to take control before inspecting tabs", async () => {
  let resolveClaim
  const claimPromise = new Promise(resolve => { resolveClaim = resolve })
  const state = harness({ claimPromise, clients: [{ url: "https://denuchange.vercel.app/agenda", ready: true }] })
  const activation = state.activate()
  await settle()
  assert.deepEqual(state.actions, ["claim"])
  assert.deepEqual(state.messages, [])
  assert.deepEqual(state.navigations, [])
  resolveClaim()
  await activation
  assert.deepEqual(state.actions, ["claim", "matchAll"])
  assert.equal(state.messages.length, 1)
})

test("only top-level windows within the exact worker origin and scope recover", async () => {
  const matched = ["https://example.test/workshop/", "https://example.test/workshop/agenda?view=mobile#tuesday"]
  const state = harness({
    scope: "https://example.test/workshop/",
    origin: "https://example.test",
    clients: [
      ...matched,
      "https://example.test/",
      "https://example.test/workshop",
      "https://example.test/workshop-old/agenda",
      "https://example.test/other/workshop/agenda",
      "https://example.test/workshop/../other/",
      "https://outside.test/workshop/agenda",
      "about:blank",
      "invalid URL",
      { url: "https://example.test/workshop/nested", frameType: "nested" },
      { url: "https://example.test/workshop/worker", type: "worker" },
    ],
  })
  const activation = state.activate()
  await settle()
  assert.deepEqual(state.messages.map(message => message.url), matched)
  state.expireReadinessChecks()
  await activation
  assert.deepEqual(state.navigations, matched.map(url => ({ from: url, to: url })))
})

test("activation completes even while a navigation waits for the worker to become active", async () => {
  const url = "https://denuchange.vercel.app/app/program"
  const state = harness({ clients: [{ url, navigationPending: true }] })
  const activation = state.activate()
  await settle()
  state.expireReadinessChecks()
  await activation
  assert.deepEqual(state.navigations, [{ from: url, to: url }])
})

test("closing or unresponsive clients cannot block other tabs", async () => {
  const urls = ["/closed-sync", "/closed-async", "/message-closed", "/unrelated-reply", "/agenda"]
    .map(path => `https://denuchange.vercel.app${path}`)
  const state = harness({ clients: [
    { url: urls[0], navigationThrows: true },
    { url: urls[1], navigationRejects: true },
    { url: urls[2], messageThrows: true },
    { url: urls[3], invalidReply: true },
    urls[4],
  ] })
  const activation = state.activate()
  await settle()
  state.expireReadinessChecks()
  await activation
  await settle()
  assert.deepEqual(state.navigations.map(navigation => navigation.to).sort(), [...urls].sort())
  assert.equal(state.timers.size, 0)
  assert.ok(state.ports.every(port => port.closed))
})

test("legacy recovery still works if MessageChannel is unavailable", async () => {
  const url = "https://denuchange.vercel.app/agenda#tuesday"
  const state = harness({ channels: false, clients: [url] })
  await state.activate()
  assert.deepEqual(state.navigations, [{ from: url, to: url }])
})

test("an unexpected cross-origin scope causes no client activity", async () => {
  const state = harness({ scope: "https://outside.test/", clients: ["https://denuchange.vercel.app/"] })
  await state.activate()
  assert.deepEqual(state.actions, [])
  assert.deepEqual(state.messages, [])
  assert.deepEqual(state.navigations, [])
})
