import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const schedule = [
  {
    day: "Day 1",
    date: "October 6",
    title: "Workshop Sessions",
    items: [
      "Welcome and Registration",
      "Keynote Presentations",
      "Oral Sessions: Weathering & Erosion",
      "Poster Session & Coffee Breaks",
    ],
  },
  {
    day: "Day 2",
    date: "October 7",
    title: "Workshop Sessions",
    items: [
      "Oral Sessions: Mass Movements",
      "Oral Sessions: Coastal Processes",
      "Discussion & Future Collaborations",
      "Workshop Dinner",
    ],
  },
  {
    day: "Day 3-4",
    date: "October 8-9",
    title: "Field Trip",
    items: [
      "Catchment to Coast Transect",
      "Erosion & Sediment Transport",
      "Coastal Geomorphology",
      "Nature-based Solutions Sites",
    ],
  },
]

export function Program() {
  return (
    <section id="program" className="py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Program
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Workshop Schedule
          </h2>
          <p className="text-muted-foreground">
            Two days of presentations and discussions, followed by a two-day
            field excursion exploring Naxos's diverse geomorphological features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {schedule.map((day, index) => (
            <Card key={day.day} className={index === 2 ? "md:bg-primary/5" : ""}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={index === 2 ? "default" : "secondary"}>
                    {day.day}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                </div>
                <CardTitle className="text-lg">{day.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {day.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12 max-w-3xl mx-auto" />

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Detailed program with session times will be announced after abstract review.
            <br />
            Presentations can be oral or poster format.
          </p>
        </div>
      </div>
    </section>
  )
}
