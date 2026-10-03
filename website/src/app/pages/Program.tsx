import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { CalendarPlus } from "lucide-react"
import type { ProgramSession } from "../lib/program-data"
import { startProgramUpdates } from "../lib/program-updates"
import { ProgramSchedule } from "../components/ProgramSchedule"
import {
  generateSessionIcs,
  generateDayIcs,
  downloadIcsFile,
} from "../lib/calendar"

const DAYS: { date: string; label: string; short: string }[] = [
  { date: "2026-10-05", label: "Monday, 5 Oct", short: "Mon 5" },
  { date: "2026-10-06", label: "Tuesday, 6 Oct", short: "Tue 6" },
  { date: "2026-10-07", label: "Wednesday, 7 Oct", short: "Wed 7" },
]

export function Program() {
  const [sessions, setSessions] = useState<ProgramSession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState("2026-10-06")
  const [remindedId, setRemindedId] = useState<string | null>(null)

  useEffect(() => {
    return startProgramUpdates({
      loadSessions: async () => {
        const { data, error } = await supabase
          .from("program_sessions")
          .select("*")
          .order("date")
          .order("start_time")
        if (error) throw error
        return data ?? []
      },
      onSessions: setSessions,
      onReady: () => setLoading(false),
    })
  }, [])

  function handleAddReminder(session: ProgramSession) {
    const ics = generateSessionIcs(session)
    const filename = `DENUCHANGE_${session.date}_${session.start_time.replace(":", "")}_${session.id}.ics`
    downloadIcsFile(filename, ics)
    setRemindedId(session.id)
    setTimeout(() => setRemindedId((prev) => (prev === session.id ? null : prev)), 2500)
  }

  function handleDownloadDayCalendar(date: string) {
    const daySessions = sessions.filter((s) => s.date === date)
    const dayLabel = DAYS.find((d) => d.date === date)?.label ?? date
    const ics = generateDayIcs(daySessions, `DENUCHANGE 2026 - ${dayLabel}`)
    downloadIcsFile(`DENUCHANGE_${date}_Schedule.ics`, ics)
  }

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

      {/* Day label and calendar action */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs font-medium text-muted-foreground">
          {DAYS.find((d) => d.date === activeDay)?.label}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleDownloadDayCalendar(activeDay)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            title="Download full day calendar (.ics with alarms) for Apple, Android, or Outlook"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>Add Day to Cal</span>
          </button>
        </div>
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
            <p className="text-sm font-medium text-foreground">No sessions listed for this day</p>
            <p className="text-xs text-muted-foreground mt-1">
              View the full agenda for the workshop schedule.
            </p>
          </div>
        ) : (
          <ProgramSchedule
            sessions={daySession}
            remindedId={remindedId}
            onAddReminder={handleAddReminder}
          />
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
