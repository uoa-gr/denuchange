import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { AppRouter } from './app/router.tsx'

const updateIntervalMs = 60 * 1000

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return

    const checkForUpdate = async () => {
      if (registration.installing || !navigator.onLine) return

      try {
        const response = await fetch(swUrl, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-cache' },
        })

        if (response.ok) await registration.update()
      } catch {
        // Keep the current offline-capable version when the update check cannot connect.
      }
    }

    void checkForUpdate()
    window.setInterval(() => void checkForUpdate(), updateIntervalMs)
    window.addEventListener('focus', () => void checkForUpdate())
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void checkForUpdate()
    })
  },
})

const OpsExportPage = lazy(() =>
  import('./pages/ops/OpsExportPage.tsx').then((m) => ({ default: m.OpsExportPage })),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/OPS_DATA_EXPORT"
          element={
            <Suspense fallback={<div style={{ padding: 24, fontSize: 14 }}>Loading…</div>}>
              <OpsExportPage />
            </Suspense>
          }
        />
        <Route path="/app/*" element={<AppRouter />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
