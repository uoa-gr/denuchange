import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions sets GITHUB_ACTIONS=true; Vercel leaves it unset → base '/'
  base: process.env.GITHUB_ACTIONS ? '/denuchange/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MiB
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'DENUCHANGE 2026',
        short_name: 'DENUCHANGE',
        description: '5th IAG DENUCHANGE Workshop – Naxos, Greece',
        theme_color: '#074F6A',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/app/',
        scope: '/',
        icons: [
          {
            src: '/images/logo-denuchange.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: '/images/logo-denuchange.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
