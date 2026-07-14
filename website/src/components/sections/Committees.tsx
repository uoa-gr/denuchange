import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const organizingCommittee = [
  { name: "Prof. Niki Evelpidou", affiliation: "NKUA, Greece" },
  { name: "Prof. Assimina Antonarakou", affiliation: "NKUA, Greece" },
  { name: "Dr. Anna Karkani", affiliation: "NKUA, Greece" },
  { name: "Dr. Giannis Saitis", affiliation: "NKUA, Greece" },
  { name: "Alexandros Liaskos", affiliation: "NKUA, Greece" },
]

const scientificCommittee = [
  { name: "Dr. Achim A. Beylich", affiliation: "GFL, Norway" },
  { name: "Prof. Niki Evelpidou", affiliation: "NKUA, Greece" },
  { name: "Dr. Anna Karkani", affiliation: "NKUA, Greece" },
  { name: "Dr. Eliza Płaczkowska", affiliation: "University of Wrocław, Poland" },
  { name: "Prof. Nurit Shtober-Zisu", affiliation: "University of Haifa, Israel" },
  { name: "Prof. Zbigniew Zwoliński", affiliation: "Adam Mickiewicz University, Poland" },
]

export function Committees() {
  return (
    <section id="committees" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Committees
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Workshop Organization
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Organizing Committee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organizing Committee</CardTitle>
              <p className="text-sm text-muted-foreground">
                NKUA Dept. of Geology & Geoenvironment
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {organizingCommittee.map((member) => (
                <div key={member.name} className="flex flex-col">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {member.affiliation}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Scientific Committee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scientific Committee</CardTitle>
              <p className="text-sm text-muted-foreground">
                International review board
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {scientificCommittee.map((member) => (
                <div key={member.name} className="flex flex-col">
                  <span className="font-medium text-sm">{member.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {member.affiliation}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
