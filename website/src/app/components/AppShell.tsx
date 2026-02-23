import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { BottomNav } from "./BottomNav"
import { useAuth } from "../lib/auth"

export function AppShell() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/app/auth/email", { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="flex-none flex items-center px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/images/logo-denuchange.jpg"
            alt="DENUCHANGE"
            className="h-8 w-8 rounded object-cover flex-none"
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight text-foreground truncate">DENUCHANGE 2026</p>
            <p className="text-xs text-muted-foreground leading-tight">6–9 Oct · Naxos, Greece</p>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  )
}
