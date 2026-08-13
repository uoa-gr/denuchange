import { Badge } from "@/components/ui/badge"

type Organisation = {
  title: string
  href: string
  image: string
  imageClassName: string
}

const organisations: Organisation[] = [
  {
    title: "National and Kapodistrian University of Athens",
    href: "https://en.uoa.gr/",
    image: "images/logo-nkua.jpg",
    imageClassName: "h-10 w-10",
  },
  {
    title: "Laguna Coast Foundation",
    href: "https://lagunacoast.org/",
    image: "images/laguna-coast-foundation.png",
    imageClassName: "h-10 w-20",
  },
  {
    title: "International Association of Geomorphologists",
    href: "https://www.geomorph.org/",
    image: "images/logo-iag.jpg",
    imageClassName: "h-10 w-10",
  },
  {
    title: "IAG Working Group Denudation and Environmental Changes in Different Morphoclimatic Zones (DENUCHANGE)",
    href: "https://www.geomorph.org/denuchange-working-group-4/",
    image: "images/logo-denuchange.jpg",
    imageClassName: "h-10 w-10 rounded-full",
  },
  {
    title: "IAG Working Group Virtual Trips in Geomorphology",
    href: "https://www.geomorph.org/virtual-trips-in-geomorphology/",
    image: "images/logo-vft-working-group.png",
    imageClassName: "h-10 w-10 rounded-full",
  },
]

const supporter: Organisation = {
  title: "Municipality of Naxos and Small Cyclades",
  href: "https://e-naxos.eu/",
  image: "images/municipality-naxos-small-cyclades.png",
  imageClassName: "h-12 w-16",
}

function OrganisationCard({
  organisation,
  className = "",
}: {
  organisation: Organisation
  className?: string
}) {
  return (
    <a
      href={organisation.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-lg border bg-background p-3.5 transition-colors hover:bg-muted/50 ${className}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}${organisation.image}`}
        alt={organisation.title}
        className={`${organisation.imageClassName} flex-shrink-0 object-contain`}
        loading="lazy"
      />
      <div className="min-w-0 text-left">
        <p className="text-sm font-medium leading-snug">{organisation.title}</p>
      </div>
    </a>
  )
}

export function CoOrganiser() {
  return (
    <section aria-labelledby="co-organiser-heading" className="border-y bg-muted/30">
      <div className="container py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <h2
            id="co-organiser-heading"
            className="mb-5 text-center text-base font-semibold tracking-tight"
          >
            Co-organised with:
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {organisations.map((organisation, index) => (
              <OrganisationCard
                key={organisation.href}
                organisation={organisation}
                className={`md:col-span-2 ${index === 3 ? "md:col-start-2" : ""}`}
              />
            ))}
          </div>

          <h3 className="mb-4 mt-7 text-center text-sm font-semibold text-muted-foreground">
            Supported by:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-6">
            <OrganisationCard
              organisation={supporter}
              className="md:col-span-2 md:col-start-3"
            />
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
