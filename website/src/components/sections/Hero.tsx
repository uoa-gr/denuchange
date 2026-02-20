import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function Hero() {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay so the entrance animation is visible even if image is cached
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
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
        className="relative z-10 mx-4 max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl px-8 py-12 text-center"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(1.5rem)",
          transition: "opacity 0.9s ease-out 0.3s, transform 0.9s ease-out 0.3s",
        }}
      >
          <p className="text-xs font-medium tracking-[0.2em] text-primary mb-4 uppercase">
            October 6–9, 2026 · Naxos, Greece
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            IAG <span className="text-primary">DENUCHANGE</span> Workshop
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-8">
            5th International Workshop of the IAG Working Group on Denudation
            and Environmental Changes in Different Morphoclimatic Zones.
          </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <a href="#registration">Register Now</a>
          </Button>
          <Button size="lg" asChild className="bg-gradient-to-b from-[#f5d030] via-[#f1c100] to-[#d9ae00] hover:brightness-110 text-zinc-900 font-bold border-none shadow-sm hover:shadow-md">
            <a href="#program">View Program</a>
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
