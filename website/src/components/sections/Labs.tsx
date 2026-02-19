import { Badge } from "@/components/ui/badge"

const highlights = [
  "Hands-on design and application of Virtual Field Trips for geomorphological research and education",
  "VR headset demonstrations of immersive Virtual Field Trip examples",
  "Active collaboration between members of the two Working Groups",
  "Particularly recommended for early-career geomorphologists",
  "Opportunities for skill enhancement and exchange of innovative ideas",
]

export function Labs() {
  return (
    <section id="labs" className="py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Labs
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Virtual Field Trip Laboratories
          </h2>
          <p className="text-muted-foreground">
            Hands-on interactive sessions offered by the{" "}
            <a
              href="https://www.geomorph.org/virtual-trips-in-geomorphology/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              IAG Working Group "Virtual Field Trips in Geomorphology"
            </a>{" "}
            during the workshop.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <p className="text-muted-foreground mb-6">
              These interactive sessions provide participants with practical experience in the design
              and application of Virtual Field Trips (VFTs) for geomorphological research and education,
              fostering active collaboration between members of the two Working Groups.
            </p>
            <ul className="space-y-3">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
