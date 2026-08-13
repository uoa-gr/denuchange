import { Badge } from "@/components/ui/badge"
import { Monitor, Headset, Users, GraduationCap } from "lucide-react"

const features = [
  {
    icon: Monitor,
    title: "VFT Design & Application",
    description:
      "Practical experience in designing and applying Virtual Field Trips for geomorphological research and education.",
  },
  {
    icon: Headset,
    title: "VR Immersion",
    description:
      "Use VR headsets to explore immersive examples of Virtual Field Trips firsthand.",
  },
  {
    icon: Users,
    title: "Cross-Working Group Collaboration",
    description:
      "Fostering active collaboration between members of the DENUCHANGE and VFT Working Groups.",
  },
  {
    icon: GraduationCap,
    title: "Skill Enhancement",
    description:
      "Exchange of innovative ideas and skill development, with a particular focus on early-career geomorphologists.",
  },
]

export function Labs() {
  return (
    <section id="labs" aria-labelledby="labs-heading" className="bg-muted/30 py-20 lg:py-24">
      <div className="container">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-14">
          <div className="text-center lg:text-left">
            <Badge variant="outline" className="mb-4">
              Labs
            </Badge>
            <h2 id="labs-heading" className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Virtual Field Trip Laboratories
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Hands-on interactive sessions offered by the{" "}
              <a
                href="https://www.geomorph.org/virtual-trips-in-geomorphology/"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                IAG Working Group "Virtual Field Trips in Geomorphology"
              </a>{" "}
              running alongside the workshop program.
            </p>
          </div>

          <ul
            aria-label="Laboratory focus areas"
            className="grid overflow-hidden rounded-2xl border border-border/90 bg-card shadow-[0_16px_44px_-32px_rgba(15,42,68,0.6)] sm:grid-cols-2"
          >
          {features.map((feature) => (
              <li
                key={feature.title}
                className="group border-b border-border/80 p-6 last:border-b-0 sm:min-h-52 sm:p-7 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(3)]:border-b-0"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2.5 text-base font-bold leading-snug text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </li>
          ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
