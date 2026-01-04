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
            Advancing Our Understanding of Denudation Processes
          </h2>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              The 5th DENUCHANGE International Workshop brings together geoscientists
              from around the world to advance our understanding of denudation processes
              including weathering, erosion, and mass movements in both coastal and
              terrestrial environments.
            </p>

            <p>
              Building on the success of previous workshops in Poland (2018),
              Spain (2019), Israel (2023), and Italy (2024), this year's meeting
              will focus on understanding drivers, rates, diversity, and variability
              of denudation processes worldwide.
            </p>

            <p>
              The workshop provides an excellent platform to present research findings,
              exchange ideas, and foster international collaborations.
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
