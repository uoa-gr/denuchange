import { Badge } from "@/components/ui/badge"
import { ArrowUpRight } from "lucide-react"

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
    imageClassName: "h-9 w-24",
  },
  {
    title: "Laguna Coast Foundation",
    href: "https://lagunacoast.org/",
    image: "images/laguna-coast-foundation.png",
    imageClassName: "h-9 w-28",
  },
  {
    title: "International Association of Geomorphologists",
    href: "https://www.geomorph.org/",
    image: "images/logo-iag.jpg",
    imageClassName: "h-10 w-20",
  },
  {
    title: "IAG Working Group Denudation and Environmental Changes in Different Morphoclimatic Zones (DENUCHANGE)",
    href: "https://www.geomorph.org/denuchange-working-group-4/",
    image: "images/logo-denuchange.jpg",
    imageClassName: "h-11 w-11 rounded-full",
  },
  {
    title: "IAG Working Group Virtual Trips in Geomorphology",
    href: "https://www.geomorph.org/virtual-trips-in-geomorphology/",
    image: "images/logo-vft-working-group.png",
    imageClassName: "h-11 w-11 rounded-full",
  },
]

const supporter: Organisation = {
  title: "Municipality of Naxos and Small Cyclades",
  href: "https://e-naxos.eu/",
  image: "images/municipality-naxos-small-cyclades.png",
  imageClassName: "h-14 w-24",
}

function OrganisationRow({
  organisation,
}: {
  organisation: Organisation
}) {
  return (
    <a
      href={organisation.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid min-h-16 grid-cols-[6rem_minmax(0,1fr)_1.25rem] items-center gap-4 px-2 py-3 transition-colors duration-200 ease-out hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:grid-cols-[8rem_minmax(0,1fr)_1.25rem] sm:px-4"
    >
      <span className="flex h-14 items-center justify-center">
        <img
          src={`${import.meta.env.BASE_URL}${organisation.image}`}
          alt=""
          className={`${organisation.imageClassName} object-contain`}
          loading="lazy"
        />
      </span>
      <span className="text-pretty text-sm font-medium leading-snug sm:text-[0.9375rem]">
        {organisation.title}
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="h-4 w-4 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
      <span className="sr-only">Opens in a new tab</span>
    </a>
  )
}

export function CoOrganiser() {
  return (
    <section aria-labelledby="co-organiser-heading" className="border-y bg-background">
      <div className="container py-10 sm:py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-5 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
            <h2
              id="co-organiser-heading"
              className="text-lg font-semibold leading-tight tracking-tight md:pt-5"
            >
              Co-organised with:
            </h2>

            <ol
              aria-label="Co-organising institutions and working groups"
              className="border-y border-border/90"
            >
              {organisations.map((organisation) => (
                <li key={organisation.href} className="border-t first:border-t-0">
                  <OrganisationRow organisation={organisation} />
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-5 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
            <h3 className="text-sm font-semibold text-muted-foreground md:pt-5">
              Supported by:
            </h3>
            <div className="border-y border-border/90">
              <OrganisationRow organisation={supporter} />
            </div>
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
