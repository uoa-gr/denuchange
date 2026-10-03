/// <reference lib="webworker" />

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<PrecacheEntry | string> }

// Recovery is loaded before the app bundle and also reaches legacy open clients.
self.importScripts(new URL('sw-refresh.js', self.registration.scope).href)
void self.skipWaiting()

// Route online HTML first, including explicit index URLs that the precache matches.
registerRoute(
  ({ request, url, sameOrigin }) =>
    request.mode === 'navigate' &&
    sameOrigin &&
    !/^\/(?:api|_vercel)(?:\/|$)/.test(url.pathname) &&
    !/\.pdf$/i.test(url.pathname),
  async ({ request }) => {
    try {
      return await fetch(request, { cache: 'no-store' })
    } catch (error) {
      const offlineShell = await matchPrecache('index.html')
      if (offlineShell) return offlineShell
      throw error
    }
  },
)

precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: '', cleanURLs: false })
cleanupOutdatedCaches()

registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)
