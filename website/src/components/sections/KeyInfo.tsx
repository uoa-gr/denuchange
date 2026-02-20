import { Card } from "@/components/ui/card"
import { CalendarDays, MapPin, Clock } from "lucide-react"

const infoItems = [
  {
    icon: CalendarDays,
    label: "Workshop Dates",
    value: "October 6-9, 2026",
    detail: "Oct 6-7 sessions · Oct 8-9 field trip",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Naxos, Greece",
    detail: "Largest island of the Cyclades",
  },
  {
    icon: Clock,
    label: "Abstract Deadline",
    value: "May 30, 2026",
    detail: "Registration by July 15",
  },
]

export function KeyInfo() {
  return (
    <section className="py-12 -mt-12 relative z-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {infoItems.map((item) => (
            <Card
              key={item.label}
              className="p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all border-2"
            >
              <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-1">
                {item.label}
              </p>
              <p className="text-lg font-semibold text-foreground mb-1">
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
