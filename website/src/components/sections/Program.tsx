import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BUS_DEPARTURE_URL, VENUE_URL } from "@/lib/travel-map-data"
import {
  ArrowDown,
  BusFront,
  CalendarDays,
  Check,
  Download,
  ExternalLink,
  MapPin,
  MapPinned,
  Presentation,
} from "lucide-react"

const detailedProgramUrl = `${import.meta.env.BASE_URL}DENUCHANGE_Program.pdf`
const iceBreakerLocationUrl = "https://maps.app.goo.gl/iDLaAnaS7PCajEDv5"

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

        <article
          id="ice-breaker"
          aria-labelledby="ice-breaker-heading"
          className="mx-auto mb-4 max-w-5xl scroll-mt-24 overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-[0_14px_38px_-32px_rgba(15,42,68,0.65)]"
        >
          <div className="grid md:grid-cols-[10.5rem_minmax(0,1fr)] lg:grid-cols-[10.5rem_minmax(0,1fr)_19rem]">
            <div className="flex items-center justify-between gap-5 border-b border-primary/10 bg-primary/[0.065] px-5 py-4 md:block md:border-b-0 md:border-r md:px-6 md:py-6">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">Pre-workshop</p>
                <p className="mt-1.5 text-sm font-semibold text-foreground">Monday, 5 October</p>
              </div>
              <time dateTime="2026-10-05T20:00" className="text-xl font-bold tabular-nums text-primary md:mt-3 md:block">
                20:00
              </time>
            </div>

            <div className="px-5 py-5 sm:px-6 md:py-6 lg:px-7">
              <h3 id="ice-breaker-heading" className="text-xl font-bold tracking-tight text-foreground">
                Ice Breaker
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                A welcome evening with light dinner and drinks. Live music to be announced.
              </p>
            </div>

            <div className="border-t border-border/80 px-5 py-5 sm:px-6 md:col-span-2 lg:col-span-1 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:py-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Venue</p>
              <div className="mt-2 flex flex-col items-start gap-0.5">
                <a
                  href={iceBreakerLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-8 items-center gap-1.5 rounded-sm text-sm font-semibold leading-tight text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Laguna Coast Resort</span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 opacity-65 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="#travel-map"
                  className="group inline-flex min-h-8 items-center gap-1.5 rounded-sm text-sm font-semibold leading-tight text-primary underline decoration-primary underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  View map below
                  <ArrowDown
                    className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-y-0.5 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        </article>

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
          className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-[0_18px_48px_-34px_rgba(15,42,68,0.65)]"
        >
          <div className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]">
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BusFront className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 id="workshop-transport-heading" className="text-lg font-bold text-foreground">
                  Workshop transport
                </h3>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                On both days of the workshop, a single bus service to the venue will be provided in the morning,
                departing from the central bus station in Naxos Town. The journey takes approximately 10 minutes.
                Return transfer will also be provided at the end of the day’s activities.
              </p>

              <div
                aria-label="Workshop bus location links"
                className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-0"
              >
                <a
                  href={BUS_DEPARTURE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Central bus station</span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 opacity-65 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="#travel-map"
                  className="group inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold text-primary underline decoration-primary underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  View map below
                  <ArrowDown
                    className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-y-0.5 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </a>
              </div>

              <p className="mt-3 border-t border-border/70 pt-4 text-sm leading-relaxed text-muted-foreground">
                Please note that this is the only scheduled morning departure on each day. Participants are kindly
                asked to arrive at the departure point a few minutes in advance.
              </p>
            </div>

            <div className="border-t border-primary/15 bg-primary/[0.045] p-5 sm:p-6 md:border-l md:border-t-0">
              <p className="text-sm font-bold text-foreground">Morning departures</p>
              <div className="mt-4 divide-y divide-primary/15">
                <div className="flex items-center justify-between gap-5 pb-4">
                  <div>
                    <p className="font-semibold text-foreground">Tuesday</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">6 October</p>
                  </div>
                  <time dateTime="2026-10-06T08:15" className="text-xl font-bold tabular-nums text-primary">
                    08:15
                  </time>
                </div>
                <div className="flex items-center justify-between gap-5 pt-4">
                  <div>
                    <p className="font-semibold text-foreground">Wednesday</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">7 October</p>
                  </div>
                  <time dateTime="2026-10-07T09:00" className="text-xl font-bold tabular-nums text-primary">
                    09:00
                  </time>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-4 flex max-w-5xl flex-col items-start justify-between gap-4 rounded-xl border border-primary/15 bg-primary/[0.045] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-bold text-foreground">Detailed workshop program</p>
            <p className="mt-1 text-sm text-muted-foreground">Download the complete schedule for all workshop days.</p>
          </div>
          <Button asChild className="shrink-0 font-bold">
            <a href={detailedProgramUrl} download="DENUCHANGE_Program.pdf">
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Detailed Program
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
