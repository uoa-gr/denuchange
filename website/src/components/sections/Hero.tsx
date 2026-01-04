import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-slate-800">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-naxos-aerial.jpeg`}
          alt="Aerial view of Naxos coastline"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-4 max-w-2xl bg-white/90 backdrop-blur-sm rounded-lg shadow-xl px-8 py-12">
          <p className="text-xs font-medium tracking-[0.2em] text-primary mb-4 uppercase">
            October 6–9, 2026 · Naxos, Greece
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            IAG Working Group on
            <br />
            <span className="text-primary">Denudation</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-8">
            5th International Workshop on weathering, erosion, and mass movement
            processes in coastal and terrestrial environments.
          </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <a href="#registration">Register Now</a>
          </Button>
          <Button size="lg" asChild className="bg-[#f1c100] hover:bg-[#d9ae00] text-zinc-900 border-none">
            <a href="#program">View Program</a>
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
