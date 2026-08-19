import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarClock, CalendarDays, ChevronsDown, FileText, MapPin, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"

const detailedProgramUrl = `${import.meta.env.BASE_URL}DENUCHANGE_Program.pdf`

export function Hero() {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay so the entrance animation is visible even if image is cached
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:py-20"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-slate-800">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-naxos-aerial.jpeg`}
          alt="Aerial view of Naxos coastline"
          className={`h-full w-full object-cover transition-[opacity,transform] duration-[1600ms] ease-out motion-reduce:transition-none ${
            imgLoaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
          }`}
          width={1920}
          height={1080}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/15 to-slate-950/70" />
      </div>

      {/* Content Container */}
      <div
        className={`relative z-20 w-full max-w-4xl transition-[opacity,transform] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/[0.96] px-5 py-8 text-center shadow-[0_24px_80px_-24px_rgba(2,32,52,0.68)] ring-1 ring-slate-950/5 sm:px-9 sm:py-9 lg:px-12">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true">
            <span className="mx-auto block h-full w-20 bg-[var(--iag-yellow)]" />
          </div>

        <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary">
          IAG Working Group
        </p>

        <h1
          id="hero-heading"
          className="mb-4 text-balance text-[clamp(2rem,5vw,3.35rem)] font-bold leading-[1.08] tracking-[-0.035em] text-foreground"
        >
          IAG <span className="text-primary">DENUCHANGE</span> Workshop
        </h1>

        <p className="mx-auto mb-6 max-w-2xl text-pretty text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          5th International Workshop of the IAG Working Group on Denudation
          and Environmental Changes in Different Morphoclimatic Zones.
        </p>

        <dl
          aria-label="Workshop details"
          className="mb-6 grid overflow-hidden rounded-xl border border-primary/15 bg-secondary/55 md:grid-cols-3"
        >
          <div className="flex items-center gap-3 px-4 py-3.5 text-left sm:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
              <CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-primary/75">
                Date
              </dt>
              <dd className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                6–9 October 2026
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-primary/10 px-4 py-3.5 text-left sm:px-5 md:border-l md:border-t-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
              <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-primary/75">
                Location
              </dt>
              <dd className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                Naxos, Greece
              </dd>
            </div>
          </div>

          <div className="border-t border-primary/10 md:border-l md:border-t-0">
            <dt className="sr-only">Pre-workshop event</dt>
            <dd className="h-full">
              <a
                href="#ice-breaker"
                className="group flex h-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
                  <CalendarClock className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-primary/75">
                    Pre-workshop event
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold tracking-tight text-foreground">
                    Ice Breaker
                  </span>
                  <span className="block text-[0.7rem] text-muted-foreground">
                    5 October · 20:00
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-primary/65 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </a>
            </dd>
          </div>
        </dl>

        <nav aria-label="Workshop actions" className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="h-11 rounded-lg px-7 font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none"
          >
            <a href={detailedProgramUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4" aria-hidden="true" />
              View Detailed Program
            </a>
          </Button>
          <a
            href="#app"
            className="group inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            Get the Attendee App
          </a>
        </nav>

        </div>

        <a
          href="#program"
          aria-label="View more details below"
          className="group mx-auto mt-4 flex w-fit flex-col items-center gap-0.5 text-white drop-shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
        >
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em]">
            View more
          </span>
          <ChevronsDown
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </a>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
