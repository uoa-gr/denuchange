import { Badge } from "@/components/ui/badge"

export function CoOrganiser() {
  return (
    <section aria-labelledby="co-organiser-heading" className="border-y bg-muted/30">
      <div className="container py-12 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <h2
            id="co-organiser-heading"
            className="mb-7 text-center text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Co-organised with:
          </h2>

          <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-6">
            <a
              href="https://www.geomorph.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-24 items-center gap-4 rounded-lg border bg-background p-5 transition-colors hover:bg-muted/50 md:col-span-2"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/logo-iag.jpg`}
                alt="IAG"
                className="h-12 w-16 flex-shrink-0 object-contain"
                loading="lazy"
              />
              <div className="text-left">
                <p className="font-medium">IAG</p>
                <p className="text-sm text-muted-foreground">International Association of Geomorphologists</p>
              </div>
            </a>

            <a
              href="https://www.geomorph.org/denuchange-working-group-4/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-24 items-center gap-4 rounded-lg border bg-background p-5 transition-colors hover:bg-muted/50 md:col-span-2"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/logo-denuchange.jpg`}
                alt="DENUCHANGE"
                className="h-12 w-12 flex-shrink-0 rounded-full object-contain"
                loading="lazy"
              />
              <div className="text-left">
                <p className="font-medium">DENUCHANGE</p>
                <p className="text-sm text-muted-foreground">IAG Working Group</p>
              </div>
            </a>

            <a
              href="https://en.uoa.gr/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-24 items-center gap-4 rounded-lg border bg-background p-5 transition-colors hover:bg-muted/50 md:col-span-2"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/logo-nkua.jpg`}
                alt="NKUA"
                className="h-12 w-16 flex-shrink-0 object-contain"
                loading="lazy"
              />
              <div className="text-left">
                <p className="font-medium">NKUA</p>
                <p className="text-sm text-muted-foreground">National &amp; Kapodistrian University of Athens</p>
              </div>
            </a>

            <a
              href="https://www.geomorph.org/virtual-trips-in-geomorphology/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-24 items-center gap-4 rounded-lg border bg-background p-5 transition-colors hover:bg-muted/50 md:col-span-2 md:col-start-2"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/virtual-trips-in-geomorphology.jpg`}
                alt="Virtual Trips in Geomorphology"
                className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                loading="lazy"
              />
              <div className="text-left">
                <p className="font-medium">Virtual Trips in Geomorphology</p>
                <p className="text-sm text-muted-foreground">IAG Working Group</p>
              </div>
            </a>

            <a
              href="https://lagunacoast.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-24 items-center gap-4 rounded-lg border bg-background p-5 transition-colors hover:bg-muted/50 md:col-span-2"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/laguna-coast-foundation.png`}
                alt="Laguna Coast Foundation"
                className="h-12 w-24 flex-shrink-0 object-contain"
                loading="lazy"
              />
              <div className="text-left">
                <p className="font-medium">Laguna Coast Foundation</p>
                <p className="text-sm text-muted-foreground">Workshop co-organiser</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <>
      <CoOrganiser />
      <section id="about" className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              About the Workshop
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight mb-6">
              <a
                href="https://www.geomorph.org/denuchange-working-group-4/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Advancing Our Understanding of Denudation Processes
              </a>
            </h2>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                The workshop aims to bring together geoscientists, to contribute to an
                advanced understanding of denudation processes, such as weathering, erosion
                and mass movements in both coastal and terrestrial environments, their drivers,
                rates, diversity and variability around the world, and to facilitate future
                collaborations.
              </p>

              <p>
                Building on the success of previous workshops in Poland (2018),
                Spain (2019), Israel (2023), and Italy (2024), the 5th International
                DENUCHANGE Workshop provides an excellent platform to present research
                findings, exchange ideas, and foster international scientific partnerships.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-2xl font-bold text-primary">5th</p>
                <p className="text-sm text-muted-foreground">Workshop Edition</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-2xl font-bold text-primary">4</p>
                <p className="text-sm text-muted-foreground">Days of Science</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-2xl font-bold text-primary">2</p>
                <p className="text-sm text-muted-foreground">Day Field Trip</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
