import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-naxos-aerial.jpeg`}
          alt="Aerial view of Naxos coastline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content Container with Wavy Shape */}
      <div className="relative z-10 mx-4 max-w-2xl">
        {/* Wavy background shape */}
        <div className="absolute inset-0 -m-8">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M20,30
                 Q50,10 100,25
                 T200,20
                 T300,30
                 T380,25
                 Q400,30 395,50
                 Q400,100 390,150
                 Q395,200 385,250
                 Q380,280 350,285
                 T250,290
                 T150,285
                 T50,290
                 Q20,285 15,260
                 Q5,200 15,150
                 Q10,100 20,50
                 Q15,35 20,30"
              fill="white"
              className="drop-shadow-2xl"
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className="relative z-10 text-center px-8 py-12">
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
            <Button size="lg" variant="outline" asChild>
              <a href="#program">View Program</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
