import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
    <section id="labs" className="py-20 bg-muted/30">
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
              className="text-primary hover:underline cursor-pointer"
            >
              IAG Working Group "Virtual Field Trips in Geomorphology"
            </a>{" "}
            running alongside the workshop program.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
