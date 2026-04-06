import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppRouter } from './app/router.tsx'
import { OpsExportPage } from './pages/ops/OpsExportPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/OPS_DATA_EXPORT" element={<OpsExportPage />} />
        <Route path="/app/*" element={<AppRouter />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
