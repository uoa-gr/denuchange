import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Clock, MapPin } from "lucide-react"

interface ProgramSession {
  id: string
  date: string
  start_time: string
  end_time: string
  title: string
  description: string
  location: string
  session_type: string
}

const DAYS: { date: string; label: string; short: string }[] = [
  { date: "2026-10-06", label: "Tuesday, 6 Oct", short: "Tue 6" },
  { date: "2026-10-07", label: "Wednesday, 7 Oct", short: "Wed 7" },
  { date: "2026-10-08", label: "Thursday, 8 Oct", short: "Thu 8" },
  { date: "2026-10-09", label: "Friday, 9 Oct", short: "Fri 9" },
]

const TYPE_COLORS: Record<string, string> = {
  keynote: "border-l-primary bg-primary/5",
  session: "border-l-blue-400 bg-blue-50/50",
  break: "border-l-muted-foreground bg-muted/40",
  meal: "border-l-amber-400 bg-amber-50/50",
  field_trip: "border-l-green-500 bg-green-50/50",
  social: "border-l-purple-400 bg-purple-50/50",
}

const TYPE_BADGES: Record<string, string> = {
  keynote: "bg-primary/10 text-primary",
  session: "bg-blue-100 text-blue-700",
  break: "bg-muted text-muted-foreground",
  meal: "bg-amber-100 text-amber-700",
  field_trip: "bg-green-100 text-green-700",
  social: "bg-purple-100 text-purple-700",
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

export function Program() {
  const [sessions, setSessions] = useState<ProgramSession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(DAYS[0].date)

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("program_sessions")
        .select("*")
        .order("date")
        .order("start_time")
      setSessions(data ?? [])
      setLoading(false)
    })()
  }, [])

  const daySession = sessions.filter((s) => s.date === activeDay)

  return (
    <div className="flex flex-col h-full">
      {/* Day tabs */}
      <div className="flex border-b border-border bg-background overflow-x-auto">
        {DAYS.map((d) => (
          <button
            key={d.date}
            onClick={() => setActiveDay(d.date)}
            className={`flex-1 min-w-[80px] py-3 px-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeDay === d.date
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.short}
          </button>
        ))}
      </div>

      {/* Day label */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground">
          {DAYS.find((d) => d.date === activeDay)?.label}
        </p>
        {(activeDay === "2026-10-08" || activeDay === "2026-10-09") && (
          <p className="text-xs text-green-600 font-medium mt-0.5">Field Trip Day</p>
        )}
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : daySession.length === 0 ? (
          <div className="text-center py-12">
            <Calendar2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Schedule coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              The detailed programme will be announced closer to the event.
            </p>
          </div>
        ) : (
          daySession.map((s) => (
            <div
              key={s.id}
              className={`rounded-lg border-l-4 p-3 ${TYPE_COLORS[s.session_type] ?? TYPE_COLORS.session}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground leading-snug">{s.title}</p>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-none capitalize ${
                    TYPE_BADGES[s.session_type] ?? TYPE_BADGES.session
                  }`}
                >
                  {s.session_type.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(s.start_time)} – {formatTime(s.end_time)}
                </span>
                {s.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {s.location}
                  </span>
                )}
              </div>
              {s.description && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Inline icon to avoid unused import issues
function Calendar2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
