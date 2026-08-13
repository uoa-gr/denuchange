import { Badge } from "@/components/ui/badge"
import { CalendarDays, Check, Info, MapPinned, Presentation } from "lucide-react"

const schedule = [
  {
    date: "October 6-7",
    title: "Workshop Sessions",
    items: [
      "Oral & poster presentations",
      "Coffee breaks & lunches included",
      "Workshop Dinner (Oct 7)",
    ],
  },
  {
    date: "October 8-9",
    title: "Field Trip",
    items: [
      "Catchment to coast transect",
      "Naxos geomorphological sites",
      "Lunches included",
    ],
  },
]

export function Program() {
  return (
    <section id="program" aria-labelledby="program-heading" className="py-20 lg:py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-14">
          <Badge variant="outline" className="mb-4">
            Program
          </Badge>
          <h2 id="program-heading" className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Workshop Schedule
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Two days of presentations and discussions, followed by a two-day
            field excursion exploring Naxos's diverse geomorphological features.
          </p>
        </div>

        <ol
          aria-label="Workshop schedule"
          className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-border/90 bg-card shadow-[0_16px_44px_-32px_rgba(15,42,68,0.6)] md:grid-cols-2"
        >
          {schedule.map((item, index) => (
            <li
              key={item.title}
              className={`relative flex min-h-full flex-col p-6 sm:p-8 ${
                index === 1
                  ? "border-t border-border/90 bg-secondary/40 md:border-l md:border-t-0"
                  : "bg-card"
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold text-primary">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  {index === 0 ? (
                    <Presentation className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <MapPinned className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
              </div>

              <ul className="mt-auto space-y-3 border-t border-border/70 pt-5">
                  {item.items.map((listItem, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      <span className="pt-px">{listItem}</span>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 flex max-w-5xl items-start gap-3 rounded-xl border border-[#f1c100]/30 bg-[#f1c100]/12 px-5 py-4 sm:items-center sm:justify-center">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70 sm:mt-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-foreground/80">
            <span className="font-bold">Note:</span> Detailed program with session times will be announced closer to the event.
          </p>
        </div>
      </div>
    </section>
  )
}
