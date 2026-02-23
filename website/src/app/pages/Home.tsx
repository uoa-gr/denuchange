import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { supabase } from "@/lib/supabase"
import { Calendar, MapPin, Bell, ArrowRight } from "lucide-react"

const EVENT_DATE = new Date("2026-10-06T09:00:00+03:00")

function getCountdown() {
  const diff = EVENT_DATE.getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return { days, hours }
}

interface LatestNotification {
  title: string
  created_at: string
}

const REG_TYPE_LABELS: Record<string, string> = {
  regular_full: "Regular – Full",
  student_full: "Student – Full",
  meeting_only: "Meeting Only",
  accompanying: "Accompanying Person",
}

export function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(getCountdown())
  const [latestAlert, setLatestAlert] = useState<LatestNotification | null>(null)

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    supabase
      .from("notifications")
      .select("title, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setLatestAlert(data))
  }, [])

  const displayName = user
    ? user.firstName
      ? `Hi, ${user.firstName}!`
      : `Hi, ${user.email.split("@")[0]}!`
    : ""

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="pt-2">
        <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">5th IAG DENUCHANGE Workshop</p>
      </div>

      {/* Countdown card */}
      {countdown && (
        <div className="rounded-xl bg-primary text-primary-foreground p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80 mb-2">Workshop starts in</p>
          <div className="flex items-end gap-4">
            <div>
              <span className="text-5xl font-bold tabular-nums">{countdown.days}</span>
              <span className="text-sm font-medium ml-1 opacity-80">days</span>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-semibold tabular-nums">{countdown.hours}</span>
              <span className="text-sm font-medium ml-1 opacity-80">hrs</span>
            </div>
          </div>
          <p className="text-xs opacity-70 mt-2">6 October 2026 · Naxos, Greece</p>
        </div>
      )}

      {/* Quick-info cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <Calendar className="h-5 w-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Dates</p>
          <p className="text-sm font-semibold text-foreground">6–9 Oct 2026</p>
          <p className="text-xs text-muted-foreground">Sessions: 6–7 · Field trip: 8–9</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <MapPin className="h-5 w-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="text-sm font-semibold text-foreground">Naxos, Greece</p>
          <p className="text-xs text-muted-foreground">Cyclades, Aegean Sea</p>
        </div>
      </div>

      {/* Registration type */}
      {user?.registrationType && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Your registration</p>
          <p className="text-sm font-medium text-foreground">
            {REG_TYPE_LABELS[user.registrationType] ?? user.registrationType}
          </p>
        </div>
      )}

      {/* Latest alert snippet */}
      {latestAlert && (
        <button
          onClick={() => navigate("/app/alerts")}
          className="w-full rounded-xl border border-border bg-card p-4 flex items-start gap-3 text-left hover:bg-muted/50 transition-colors"
        >
          <Bell className="h-5 w-5 text-primary flex-none mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Latest announcement</p>
            <p className="text-sm font-medium text-foreground truncate">{latestAlert.title}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-none mt-1" />
        </button>
      )}

      {/* Field trip teaser */}
      <button
        onClick={() => navigate("/app/fieldtrip")}
        className="w-full rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 text-left">
          <p className="text-xs text-muted-foreground mb-0.5">Field trip</p>
          <p className="text-sm font-semibold text-foreground">8–9 October 2026</p>
          <p className="text-xs text-muted-foreground">9 stops across Naxos island</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground flex-none" />
      </button>
    </div>
  )
}
