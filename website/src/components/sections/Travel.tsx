import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plane, Ship, Hotel, ExternalLink } from "lucide-react"

const hotels = [
  {
    name: "Princess of Naxos",
    location: "Agios Georgios Beach, 800m to centre",
    website: "https://princessofnaxos.com",
  },
  {
    name: "Princess Mare",
    location: "Agios Georgios Beach, in the centre",
    website: "https://princessmare.com.gr/",
  },
  {
    name: "Hotel Grotta",
    location: "Grotta area, 400m to centre",
    website: "https://www.hotelgrotta.gr/",
  },
]

export function Travel() {
  return (
    <section id="travel" className="py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Travel & Accommodation
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Getting to Naxos
          </h2>
          <p className="text-muted-foreground">
            Naxos is accessible by air and sea from Athens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* By Air */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">By Air</CardTitle>
                <p className="text-sm text-muted-foreground">~35 min from Athens</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Naxos Airport (JNX)</p>
                <p className="text-sm text-muted-foreground">
                  "Apollo" State Airport, 3km from Naxos Town
                </p>
              </div>
              <div>
                <p className="font-medium">Sky Express</p>
                <p className="text-sm text-muted-foreground">
                  Athens (ATH) → Naxos (JNX)<br />
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.skyexpress.gr/en" target="_blank" rel="noopener noreferrer">
                  Book Flights <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* By Ferry */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Ship className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">By Ferry</CardTitle>
                <p className="text-sm text-muted-foreground">3-6h from Piraeus</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">From Piraeus Port</p>
                <p className="text-sm text-muted-foreground">
                  High-speed: 3-4h (SeaJets, Hellenic Seaways)<br />
                  Conventional: 5-6h (Blue Star Ferries)
                </p>
              </div>
              <div>
                <p className="font-medium">From Athens Airport</p>
                <p className="text-sm text-muted-foreground">
                  Metro Line 3 to Piraeus: ~60 min, €9<br />
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.ferryhopper.com/" target="_blank" rel="noopener noreferrer">
                  Book Ferries <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-8 p-4 bg-[#f1c100]/15 border border-[#f1c100]/25 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Ferry schedules increase during summer/early fall.
            Book ferries in advance at{" "}
            <a
              href="https://www.ferryhopper.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ferryhopper.com
            </a>
          </p>
        </div>

        <Separator className="my-12 max-w-4xl mx-auto" />

        {/* Accommodation */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hotel className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold tracking-tight">Accommodation</h3>
          </div>
          <p className="text-muted-foreground">
            Suggested hotels for your stay in Naxos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {hotels.map((hotel) => (
            <Card key={hotel.name} className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{hotel.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{hotel.location}</p>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                    Visit Website <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-8 p-4 bg-[#f1c100]/15 border border-[#f1c100]/30 rounded-lg text-center">
          <p className="text-sm font-medium">
            <strong>Discount Code:</strong>{" "}
            <span className="font-mono bg-[#f1c100]/20 text-foreground px-2 py-1 rounded border border-[#f1c100]/40">DENUCHANGE2026</span>
          </p>
        </div>
      </div>
    </section>
  )
}
