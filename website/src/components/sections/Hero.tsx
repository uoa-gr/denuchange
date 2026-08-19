import { Button } from "@/components/ui/button"
import { ArrowDown, FileText, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"

const detailedProgramUrl = `${import.meta.env.BASE_URL}DENUCHANGE_Program.pdf`

const workshopFacts = [
  { label: "Date", value: "6–9 October 2026" },
  { label: "Location", value: "Naxos, Greece" },
]

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
        className={`relative z-20 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/70 bg-white/[0.96] px-5 py-8 text-center shadow-[0_24px_80px_-24px_rgba(2,32,52,0.68)] ring-1 ring-slate-950/5 transition-[opacity,transform] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none sm:px-9 sm:py-9 lg:px-12 ${
          show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
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
          className="mb-6 grid overflow-hidden rounded-xl border border-primary/15 bg-secondary/65 sm:grid-cols-2"
        >
          {workshopFacts.map((fact, index) => (
            <div
              key={fact.label}
              className={`flex items-center justify-between gap-4 px-4 py-3 text-left sm:block sm:px-5 sm:py-3.5 sm:text-center ${
                index > 0 ? "border-t border-primary/10 sm:border-l sm:border-t-0" : ""
              }`}
            >
              <dt className="text-[0.67rem] font-bold uppercase tracking-[0.16em] text-primary/80">
                {fact.label}
              </dt>
              <dd className="flex items-center justify-end gap-2 text-right text-sm font-semibold tracking-tight text-foreground sm:mt-1.5 sm:justify-center sm:text-center sm:text-[0.95rem]">
                {fact.value}
              </dd>
            </div>
          ))}
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
            href="#program"
            className="group inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View more details below
            <ArrowDown
              className="h-4 w-4 transition-transform group-hover:translate-y-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </a>
        </nav>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-border/60 pt-5 sm:flex-row sm:gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Registered attendee?</p>
          <a
            href="#app"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none"
          >
            <Smartphone className="h-4 w-4" />
            Get the Attendee App
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
