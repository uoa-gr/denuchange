import { randomUUID } from 'node:crypto'
import type { Plugin } from 'vite'

/** A release check can run even when an older application bundle cannot load. */
export function releaseFreshness(base: string): Plugin {
  const version = randomUUID()
  return {
    name: 'workshop-release-freshness',
    apply: 'build',
    transformIndexHtml(html) {
      return { html, tags: [
        { tag: 'meta', attrs: { name: 'denuchange-release', content: version }, injectTo: 'head-prepend' },
        { tag: 'script', attrs: { src: `${base}browser-refresh.js` }, injectTo: 'head' },
      ] }
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version }) })
    },
  }
}
