import { useId } from "react"
import { Bell, Check, Clock, ExternalLink, MapPin } from "lucide-react"
import type { ProgramSession } from "../lib/program-data"
import { getGoogleCalendarUrl } from "../lib/calendar"
import { groupProgramSessions, type ProgramScheduleItem } from "../lib/program-sections"
import { formatSessionTime } from "../lib/program-time"

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

interface ProgramScheduleProps {
  sessions: ProgramSession[]
  remindedId: string | null
  onAddReminder: (session: ProgramSession) => void
}

interface ProgramCardGroup {
  item: ProgramScheduleItem
  discussions: ProgramScheduleItem[]
}

function groupTalkDiscussions(items: ProgramScheduleItem[]): ProgramCardGroup[] {
  const groups: ProgramCardGroup[] = []
  for (const item of items) {
    const previous = groups[groups.length - 1]
    const lastSession = previous
      ? previous.discussions[previous.discussions.length - 1]?.session ?? previous.item.session
      : undefined
    if (
      item.session.title.trim() === "Discussion" &&
      previous &&
      previous.item.session.title.trim() !== "Discussion" &&
      (previous.item.session.session_type === "session" || previous.item.session.session_type === "keynote") &&
      item.session.date === previous.item.session.date &&
      lastSession?.end_time &&
      item.session.start_time.slice(0, 5) === lastSession.end_time.slice(0, 5)
    ) {
      previous.discussions.push(item)
    } else {
      groups.push({ item, discussions: [] })
    }
  }
  return groups
}

function ProgramCard({ item, discussions, remindedId, onAddReminder }: {
  item: ProgramScheduleItem
  discussions: ProgramScheduleItem[]
  remindedId: string | null
  onAddReminder: (session: ProgramSession) => void
}) {
  const s = item.session
  const lastDiscussion = discussions[discussions.length - 1]?.session
  const calendarSession = lastDiscussion ? { ...s, end_time: lastDiscussion.end_time || s.end_time } : s
  return (
    <article
      data-program-session-id={s.id}
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Clock className="h-3 w-3" />
          {formatSessionTime(s.start_time, s.end_time)}
        </span>
        {s.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {s.location}
          </span>
        )}
      </div>
      {item.displayedDescription && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line break-words">{item.displayedDescription}</p>
      )}
      {discussions.length > 0 && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {discussions.map(discussion => (
            <p key={discussion.session.id} data-program-discussion-id={discussion.session.id} className="leading-relaxed whitespace-pre-line">
              <span className="font-medium">Discussion</span>{" · "}
              {formatSessionTime(discussion.session.start_time, discussion.session.end_time)}
              {discussion.displayedDescription && <> · {discussion.displayedDescription}</>}
            </p>
          ))}
        </div>
      )}
      {s.title !== "Discussion" && (
        <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onAddReminder(calendarSession)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            title={`Add reminder to your device calendar (Apple / Outlook / Android) with 15-min notification${discussions.length ? "; includes presentation and discussion" : ""}`}
          >
            {remindedId === s.id ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600 font-semibold">Reminder added</span>
              </>
            ) : (
              <>
                <Bell className="h-3.5 w-3.5 text-primary/70" />
                <span>Add Reminder (.ics)</span>
              </>
            )}
          </button>

          <a
            href={getGoogleCalendarUrl(calendarSession)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            title={`Add to Google Calendar${discussions.length ? " (presentation and discussion)" : ""}`}
          >
            <span>Google Cal</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </article>
  )
}

export function ProgramSchedule({ sessions, remindedId, onAddReminder }: ProgramScheduleProps) {
  const id = useId()
  const sections = groupProgramSessions(sessions)
  const firstHeadingIndex = new Map<string, number>()
  sections.forEach((section, index) => {
    if (section.heading && !firstHeadingIndex.has(section.heading.key)) {
      firstHeadingIndex.set(section.heading.key, index)
    }
  })

  return (
    <div className="space-y-5">
      {sections.map((section, index) => {
        const cards = groupTalkDiscussions(section.items).map(({ item, discussions }) => (
          <ProgramCard key={item.session.id} item={item} discussions={discussions} remindedId={remindedId} onAddReminder={onAddReminder} />
        ))
        if (!section.heading) return <div key={section.key} className="space-y-3">{cards}</div>

        const heading = section.heading
        const firstIndex = firstHeadingIndex.get(heading.key)
        const headingId = `${id}-session-${firstIndex}`
        return (
          <section key={section.key} aria-labelledby={headingId} className="space-y-3">
            {index === firstIndex && (
              <header className="rounded-lg border border-primary/20 bg-primary/[0.08] px-4 py-3.5">
                <h2 id={headingId} className="text-base font-bold leading-snug text-foreground text-pretty">
                  <span className="mb-1 block text-xs font-semibold text-primary">{heading.label}</span>
                  {" "}{heading.title}
                </h2>
                {heading.subtitle && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{heading.subtitle}</p>}
                {heading.chairs && (
                  <p className="mt-2 text-xs leading-relaxed">
                    <span className="text-muted-foreground">Chairs:</span>{" "}
                    <strong className="font-semibold text-foreground">{heading.chairs}</strong>
                  </p>
                )}
              </header>
            )}
            {cards}
          </section>
        )
      })}
    </div>
  )
}
