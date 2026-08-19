import { Badge } from "@/components/ui/badge"
import { BUS_DEPARTURE_URL, VENUE_URL } from "@/lib/travel-map-data"
import {
  ArrowDown,
  BusFront,
  CalendarDays,
  Check,
  ExternalLink,
  Info,
  MapPin,
  MapPinned,
  Presentation,
} from "lucide-react"

const schedule = [
  {
    date: "October 6-7",
    title: "Workshop Sessions",
    items: [
      "Oral & poster presentations",
      "Coffee breaks & lunches included",
      "Workshop Dinner (Oct 7)",
    ],
    location: {
      label: "Laguna Coast Resort",
      externalUrl: VENUE_URL,
      mapHref: "#travel-map",
      mapLabel: "View map below",
    },
  },
  {
    date: "October 8-9",
    title: "Field Trip",
    items: [
      "Catchment to coast transect",
      "Naxos geomorphological sites",
      "Lunches included",
    ],
    location: {
      mapHref: "#field-trip-map",
      mapLabel: "View map below",
    },
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
          className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-border/90 bg-card shadow-[0_16px_44px_-32px_rgba(15,42,68,0.6)] lg:grid-cols-2"
        >
          {schedule.map((item, index) => (
            <li
              key={item.title}
              className={`relative flex min-h-full flex-col p-6 sm:p-8 ${
                index === 1
                  ? "border-t border-border/90 bg-secondary/40 lg:border-l lg:border-t-0"
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

              <ul className="space-y-3 border-t border-border/70 pt-5">
                {item.items.map((listItem, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="pt-px">{listItem}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-border/70 pt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Location
                </p>
                <div
                  aria-label={`${item.title} location links`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-0"
                >
                  {"externalUrl" in item.location && item.location.externalUrl && (
                    <a
                      href={item.location.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.location.label}</span>
                      <ExternalLink
                        className="h-3.5 w-3.5 shrink-0 opacity-65 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  )}
                  <a
                    href={item.location.mapHref}
                    className="group inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold text-primary underline decoration-primary underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {item.location.mapLabel}
                    <ArrowDown
                      className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-y-0.5 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section
          aria-labelledby="workshop-transport-heading"
          className="mx-auto mt-8 max-w-5xl rounded-2xl border border-border/90 bg-card px-5 py-6 shadow-[0_16px_44px_-32px_rgba(15,42,68,0.6)] sm:px-7 sm:py-7"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BusFront className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 id="workshop-transport-heading" className="text-lg font-bold text-foreground">
                Workshop transport
              </h3>
              <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  On both days of the workshop, a single bus service to the venue will be provided in the morning,
                  departing from the central bus station in Naxos Town ({" "}
                  <a
                    href={BUS_DEPARTURE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline decoration-primary underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Google Maps
                  </a>{" "}
                  ·{" "}
                  <a
                    href="#travel-map"
                    className="font-semibold text-primary underline decoration-primary underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    View map below
                  </a>
                  ). The journey takes approximately 10 minutes. Return transfer will also be provided at the end of
                  the day’s activities.
                </p>
                <p className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-foreground">
                  <span className="font-bold">Departures:</span> Tuesday 6 October at 08:15&nbsp; · &nbsp;Wednesday 7
                  October at 09:00
                </p>
                <p>
                  Please note that this is the only scheduled morning departure on each day. Participants are kindly
                  asked to arrive at the departure point a few minutes in advance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside
          aria-label="Practical information"
          className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-xl border border-[#f1c100]/30 bg-[#f1c100]/10"
        >
          <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-foreground/80">
              <span className="font-bold">Note:</span> Detailed program will be announced closer to the event.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
