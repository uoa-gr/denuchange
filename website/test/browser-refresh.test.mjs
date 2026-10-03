import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import { runInNewContext } from 'node:vm'

const sourcePath = new URL('../public/browser-refresh.js', import.meta.url)
const settle = () => new Promise(resolve => setImmediate(resolve))

function events() {
  const listeners = new Map()
  return {
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, [])
      listeners.get(name).push(callback)
    },
    dispatch(name, event = {}) { for (const callback of listeners.get(name) ?? []) callback(event) },
  }
}

function harness({ controlled = true, workerSupported = true, base = '/', version = 'old-release', registerFails = 0, storage = new Map(), now = 1000 } = {}) {
  assert.ok(fs.existsSync(sourcePath), 'An independent browser update bootstrap is required')
  const requests = []
  const registrations = []
  const intervals = []
  let reloads = 0
  let updates = 0
  const clock = { now }
  const registration = { installing: null, waiting: null, async update() { updates += 1 } }
  const worker = {
    ...events(), controller: controlled ? {} : null,
    register(url, options) {
      registrations.push({ url, options })
      return registrations.length <= registerFails ? Promise.reject(new Error('Cannot register yet')) : Promise.resolve(registration)
    },
  }
  const navigator = { onLine: true, ...(workerSupported ? { serviceWorker: worker } : {}) }
  const window = {
    ...events(),
    location: { reload() { reloads += 1 } },
    sessionStorage: { getItem(key) { return storage.get(key) ?? null }, setItem(key, value) { storage.set(key, value) } },
    setInterval(callback, delay) { intervals.push({ callback, delay }) },
  }
  const document = {
    ...events(), visibilityState: 'visible',
    currentScript: { src: `https://workshop.example${base}browser-refresh.js` },
    querySelector() { return { content: version } },
  }
  runInNewContext(fs.readFileSync(sourcePath, 'utf8'), {
    window, document, navigator, URL, Date: { now: () => clock.now },
    fetch(url, options) { return new Promise((resolve, reject) => requests.push({ url: String(url), options, resolve, reject })) },
  })
  return { requests, registrations, intervals, registration, worker, navigator, window, document,
    storage, clock, reloads: () => reloads, updates: () => updates }
}

test('the freshness bootstrap checks a release independently of app and worker support', async () => {
  const state = harness({ workerSupported: false })
  await settle()
  assert.equal(state.requests.length, 1)
  assert.equal(state.requests[0].url, 'https://workshop.example/version.json')
  assert.equal(state.requests[0].options.cache, 'no-store')
  state.requests[0].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(state.reloads(), 1)
  state.window.dispatch('focus')
  assert.equal(state.requests.length, 1, 'An already requested reload must not loop')
})

test('an existing worker controller changing reloads once while first installation does not', async () => {
  const returning = harness()
  returning.worker.dispatch('controllerchange')
  returning.worker.dispatch('controllerchange')
  assert.equal(returning.reloads(), 1)
  const first = harness({ controlled: false })
  first.worker.controller = {}
  first.worker.dispatch('controllerchange')
  assert.equal(first.reloads(), 0)
  first.worker.dispatch('controllerchange')
  assert.equal(first.reloads(), 1)
  await settle()
})

test('native registration bypasses worker/import caches and acknowledges the migration worker', async () => {
  const state = harness({ base: '/denuchange/' })
  assert.equal(state.registrations[0].url, 'https://workshop.example/denuchange/sw.js')
  assert.equal(state.registrations[0].options.scope, '/denuchange/')
  assert.equal(state.registrations[0].options.updateViaCache, 'none')
  const replies = []
  state.worker.dispatch('message', { data: { type: 'DENUCHANGE_CLIENT_READY' }, ports: [{ postMessage(data) { replies.push(data.type) } }] })
  assert.deepEqual(replies, ['DENUCHANGE_CLIENT_READY'])
  await settle()
  assert.equal(state.requests[0].url, 'https://workshop.example/denuchange/version.json')
})

test('an updated release waits for an installing worker instead of reloading into its old cache', async () => {
  const state = harness()
  await settle()
  state.registration.installing = {}
  state.requests[0].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(state.reloads(), 0)
  state.worker.dispatch('controllerchange')
  assert.equal(state.reloads(), 1)
})

test('a matching release stays open; resume, bfcache and the visible timer check again', async () => {
  const state = harness()
  await settle()
  state.requests[0].resolve({ ok: true, async json() { return { version: 'old-release' } } })
  await settle()
  assert.equal(state.reloads(), 0)
  assert.equal(state.updates(), 1)
  assert.equal(state.intervals[0].delay, 30_000)
  state.document.visibilityState = 'hidden'
  state.intervals[0].callback()
  assert.equal(state.requests.length, 1)
  state.document.visibilityState = 'visible'
  state.window.dispatch('pageshow', { persisted: true })
  state.window.dispatch('focus')
  state.document.dispatch('visibilitychange')
  assert.equal(state.requests.length, 2, 'Concurrent resume checks are deduplicated')
  state.requests[1].resolve({ ok: true, async json() { return { version: 'old-release' } } })
  await settle()
  state.intervals[0].callback()
  assert.equal(state.requests.length, 3)
})

test('offline, HTTP and invalid release responses retain the page and reconnect retries', async () => {
  const state = harness({ workerSupported: false })
  await settle()
  state.requests[0].reject(new Error('Offline'))
  await settle()
  state.navigator.onLine = false
  state.window.dispatch('focus')
  assert.equal(state.requests.length, 1)
  state.navigator.onLine = true
  state.window.dispatch('online')
  state.requests[1].resolve({ ok: false })
  await settle()
  state.window.dispatch('focus')
  state.requests[2].resolve({ ok: true, async json() { return { version: '' } } })
  await settle()
  assert.equal(state.reloads(), 0)
  state.window.dispatch('online')
  state.requests[3].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(state.reloads(), 1)
})

test('a failed registration retries without reloading into an old controlling worker', async () => {
  const state = harness({ registerFails: 1 })
  await settle()
  state.requests[0].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(state.reloads(), 0, 'The old cache is still controlling this page')
  assert.equal(state.registrations.length, 2, 'Registration must retry automatically')
  state.window.dispatch('online')
  state.requests[1].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(state.reloads(), 1)
})

test('successive stale documents do not loop but a later check retries automatically', async () => {
  const storage = new Map()
  const first = harness({ workerSupported: false, storage })
  await settle()
  first.requests[0].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(first.reloads(), 1)
  const second = harness({ workerSupported: false, storage })
  await settle()
  second.requests[0].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(second.reloads(), 0, 'The same stale HTML must not trigger an immediate reload loop')
  second.clock.now += 30_000
  second.intervals[0].callback()
  second.requests[1].resolve({ ok: true, async json() { return { version: 'new-release' } } })
  await settle()
  assert.equal(second.reloads(), 1, 'The next visible check must retry without user action')
})

test('a failed lazy chunk recovers after reconnect even when the release is unchanged', async () => {
  const state = harness({ workerSupported: false })
  await settle()
  state.requests[0].reject(new Error('Offline'))
  await settle()
  state.navigator.onLine = false
  let prevented = false
  state.window.dispatch('vite:preloadError', { preventDefault() { prevented = true } })
  assert.equal(prevented, true)
  assert.equal(state.reloads(), 0)
  state.navigator.onLine = true
  state.window.dispatch('online')
  state.requests[1].resolve({ ok: true, async json() { return { version: 'old-release' } } })
  await settle()
  assert.equal(state.reloads(), 1, 'A rejected React lazy import needs a fresh document to retry')
})
