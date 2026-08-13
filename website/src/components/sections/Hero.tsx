import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
import { useEffect, useState } from "react"

const workshopFacts = [
  { label: "Date", value: "6–9 October 2026" },
  { label: "Location", value: "Naxos, Greece" },
  { label: "Abstracts", value: "Closed" },
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
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden py-10 sm:py-16 lg:py-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-slate-800">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-naxos-aerial.jpeg`}
          alt="Aerial view of Naxos coastline"
          className="w-full h-full object-cover"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transform: imgLoaded ? "scale(1)" : "scale(1.05)",
            transition: "opacity 1.2s ease-out, transform 1.8s ease-out",
          }}
          width={1920}
          height={1080}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content Container */}
      <div
        className="relative z-10 mx-4 w-full max-w-3xl rounded-xl bg-white/95 px-5 py-8 text-center shadow-2xl backdrop-blur-sm sm:px-8 sm:py-10 lg:px-10"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(1.5rem)",
          transition: "opacity 0.9s ease-out 0.3s, transform 0.9s ease-out 0.3s",
        }}
      >
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          IAG Working Group
        </p>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          IAG <span className="text-primary">DENUCHANGE</span> Workshop
        </h1>

        <p className="mx-auto mb-7 max-w-xl text-base text-muted-foreground md:text-lg">
          5th International Workshop of the IAG Working Group on Denudation
          and Environmental Changes in Different Morphoclimatic Zones.
        </p>

        <dl
          aria-label="Workshop details"
          className="mb-7 grid overflow-hidden rounded-lg border border-border/80 bg-muted/40 sm:grid-cols-3"
        >
          {workshopFacts.map((fact, index) => (
            <div
              key={fact.label}
              className={`flex items-center justify-between gap-4 px-4 py-3 text-left sm:block sm:px-5 sm:py-4 sm:text-center ${
                index > 0 ? "border-t sm:border-l sm:border-t-0" : ""
              }`}
            >
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="flex items-center justify-end gap-2 text-right text-sm font-semibold tracking-tight text-foreground sm:mt-1.5 sm:justify-center sm:text-center">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild className="h-11 px-7">
            <a href="#registration">Register Now</a>
          </Button>
          <Button size="lg" asChild variant="warning" className="h-11 px-7 font-bold">
            <a href="#program">View Program</a>
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-border/40 flex flex-col items-center gap-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Registered attendee?</p>
          <a
            href="#app"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
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
