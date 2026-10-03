import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

test('each build publishes the same release marker in HTML and the uncached check endpoint', async context => {
  assert.ok(fs.existsSync(new URL('../scripts/release-freshness.ts', import.meta.url)), 'Builds need an independent release marker')
  const vite = await createServer({ root: fileURLToPath(new URL('..', import.meta.url)), configFile: false,
    server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true } })
  context.after(() => vite.close())
  const { releaseFreshness } = await vite.ssrLoadModule('/scripts/release-freshness.ts')
  const plugin = releaseFreshness('/denuchange/')
  const emitted = []
  plugin.generateBundle.call({ emitFile(file) { emitted.push(file) } })
  const version = JSON.parse(emitted.find(file => file.fileName === 'version.json').source).version
  assert.ok(version)
  const transformed = plugin.transformIndexHtml('<html><head></head><body></body></html>')
  assert.equal(transformed.tags.find(tag => tag.tag === 'meta').attrs.content, version)
  assert.equal(transformed.tags.find(tag => tag.tag === 'script').attrs.src, '/denuchange/browser-refresh.js')
  assert.equal(transformed.tags.find(tag => tag.tag === 'script').injectTo, 'head')
  const nextBuild = []
  releaseFreshness('/').generateBundle.call({ emitFile(file) { nextBuild.push(file) } })
  assert.notEqual(JSON.parse(nextBuild[0].source).version, version, 'A later release must be distinguishable')
})
