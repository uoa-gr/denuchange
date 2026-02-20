import { Badge } from "@/components/ui/badge"

export function About() {
  return (
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
  )
}
