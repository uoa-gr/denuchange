import { useLocation, useNavigate } from "react-router-dom"
import { House, Calendar, Bell, User, ShieldCheck, Camera } from "lucide-react"
import { useAuth } from "../lib/auth"

interface Tab {
  id: string
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const TABS: Tab[] = [
  { id: "home", label: "Home", path: "/app/home", icon: House },
  { id: "program", label: "Program", path: "/app/program", icon: Calendar },
  { id: "alerts", label: "Alerts", path: "/app/alerts", icon: Bell },
  { id: "gallery", label: "Gallery", path: "/app/gallery", icon: Camera },
  { id: "profile", label: "Profile", path: "/app/profile", icon: User },
  { id: "admin", label: "Admin", path: "/app/admin", icon: ShieldCheck, adminOnly: true },
]

export function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const visibleTabs = TABS.filter((t) => !t.adminOnly || user?.isAdmin)

  return (
    <nav className="flex-none border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex">
        {visibleTabs.map((tab) => {
          const active = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors min-h-[56px] ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
