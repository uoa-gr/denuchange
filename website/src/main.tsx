import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppRouter } from './app/router.tsx'

const OpsExportPage = lazy(() =>
  import('./pages/ops/OpsExportPage.tsx').then((m) => ({ default: m.OpsExportPage })),
)

const AgendaPage = lazy(() =>
  import('./pages/agenda/AgendaPage.tsx').then((m) => ({ default: m.AgendaPage })),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/agenda"
          element={
            <Suspense fallback={<div role="status" style={{ padding: 24 }}>Loading program…</div>}>
              <AgendaPage />
            </Suspense>
          }
        />
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
