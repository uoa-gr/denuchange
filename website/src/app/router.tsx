import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./lib/auth"
import { AppShell } from "./components/AppShell"
import { EmailPage } from "./auth/EmailPage"
import { SetupPendingPage } from "./auth/SetupPendingPage"
import { SetupPasswordPage } from "./auth/SetupPasswordPage"
import { LoginPage } from "./auth/LoginPage"
import { Home } from "./pages/Home"
import { Program } from "./pages/Program"
import { AlertsPage } from "./pages/Alerts"
import { MapPage } from "./pages/MapPage"
import { FieldTripPage } from "./pages/FieldTripPage"
import { Participants } from "./pages/Participants"
import { Gallery } from "./pages/Gallery"
import { Profile } from "./pages/Profile"
import { AdminPanel } from "./pages/admin/AdminPanel"

export function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* Password setup – opened directly from email link, no nav chrome */}
        <Route path="set-password" element={<SetupPasswordPage />} />

        {/* Auth flow */}
        <Route path="auth/email" element={<EmailPage />} />
        <Route path="auth/setup" element={<SetupPendingPage />} />
        <Route path="auth/login" element={<LoginPage />} />

        {/* Protected pages inside AppShell */}
        <Route element={<AppShell />}>
          <Route path="home" element={<Home />} />
          <Route path="program" element={<Program />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="fieldtrip" element={<FieldTripPage />} />
          <Route path="participants" element={<Participants />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        {/* Default */}
        <Route index element={<Navigate to="/app/auth/email" replace />} />
        <Route path="*" element={<Navigate to="/app/auth/email" replace />} />
      </Routes>
    </AuthProvider>
  )
}
