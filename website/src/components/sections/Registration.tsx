import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExternalLink } from "lucide-react"

const fees = [
  {
    category: "Regular (full)",
    price: "€450",
    includes: "2-day meeting + 2-day field trip",
  },
  {
    category: "Student (full)",
    price: "€300",
    includes: "2-day meeting + 2-day field trip",
  },
  {
    category: "Meeting only",
    price: "€100",
    includes: "2-day meeting (regular or student)",
  },
  {
    category: "Accompanying person",
    price: "€300",
    includes: "Field trip only",
  },
]

const deadlines = [
  { date: "May 30, 2026", event: "Abstract submission deadline" },
  { date: "June 15, 2026", event: "Author notifications" },
  { date: "July 15, 2026", event: "Registration deadline" },
]

export function Registration() {
  return (
    <section id="registration" className="py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Registration
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Join Us in Naxos
          </h2>
          <p className="text-muted-foreground">
            Register to participate in the workshop and submit your abstract
            for oral or poster presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Fees Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Registration Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Includes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => (
                    <TableRow key={fee.category}>
                      <TableCell className="font-medium">{fee.category}</TableCell>
                      <TableCell className="text-primary font-semibold">{fee.price}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {fee.includes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-4 text-xs text-muted-foreground">
                Full fee includes materials, coffee breaks, lunches (Oct 6-7),
                Workshop Dinner (Oct 7), and field trip.
              </p>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deadlines.map((d, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-semibold text-primary">{d.date}</span>
                  <span className="text-sm text-muted-foreground">{d.event}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a
                  href="https://forms.gle/Nz7TP2rviNwt8k437"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register & Submit Abstract
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Abstract Guidelines */}
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-[#f1c100]/15 border border-[#f1c100]/25 rounded-lg">
          <h3 className="font-semibold mb-3">Abstract Guidelines</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li>• Maximum 500 words (excl. title/authors)</li>
            <li>• Language: English</li>
            <li>• Format: Calibri 11pt</li>
            <li>• File naming: Surname_Name_Topic.docx</li>
            <li>• Indicate oral or poster preference</li>
            <li>• Submit via Google Form</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
