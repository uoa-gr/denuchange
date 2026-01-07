import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const schedule = [
  {
    date: "October 6-7",
    title: "Workshop Sessions",
    items: [
      "Oral & poster presentations",
      "Coffee breaks & lunches included",
      "Workshop Dinner (Oct 7)",
    ],
  },
  {
    date: "October 8-9",
    title: "Field Trip",
    items: [
      "Catchment to coast transect",
      "Naxos geomorphological sites",
      "Lunches included",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {schedule.map((item, index) => (
            <Card key={item.title} className={index === 1 ? "md:bg-primary/5" : ""}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <span className="text-sm text-muted-foreground">{item.date}</span>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {item.items.map((listItem, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                      <span>{listItem}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12 max-w-3xl mx-auto" />

        <div className="max-w-3xl mx-auto text-center p-4 bg-[#f1c100]/15 border border-[#f1c100]/25 rounded-lg">
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
