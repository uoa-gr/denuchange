import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ClipboardList, FileText, Receipt } from "lucide-react"
import { RegistrationDialog } from "@/components/forms/RegistrationDialog"
import { AbstractDialog } from "@/components/forms/AbstractDialog"
import { PaymentReceiptDialog } from "@/components/forms/PaymentReceiptDialog"

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

const actions = [
  {
    icon: ClipboardList,
    step: "Step 1",
    title: "Register",
    description: "Fill in your personal details, select your registration type, and indicate whether you plan to submit an abstract.",
    dialog: RegistrationDialog,
    label: "Register Now",
    variant: "default" as const,
  },
  {
    icon: FileText,
    step: "Step 2",
    title: "Submit Abstract",
    description: "Submit your abstract (max 500 words) as text or a .docx file. Deadline: May 30, 2026.",
    dialog: AbstractDialog,
    label: "Submit Abstract",
    variant: "outline" as const,
  },
  {
    icon: Receipt,
    step: "Step 3",
    title: "Upload Payment Receipt",
    description: "After completing your bank transfer, upload your Αποδεικτικό Πληρωμής here.",
    dialog: PaymentReceiptDialog,
    label: "Upload Receipt",
    variant: "outline" as const,
  },
]

export function Registration() {
  return (
    <section id="registration" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Registration
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Join Us in Naxos
          </h2>
          <p className="text-muted-foreground">
            Register, submit your abstract, and complete your payment in three simple steps.
          </p>
        </div>

        {/* Fees + Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                Full fee includes materials, coffee breaks, lunches (Oct 6–7),
                Workshop Dinner (Oct 7), and field trip.
              </p>
            </CardContent>
          </Card>

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
          </Card>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          {actions.map(({ icon: Icon, step, title, description, dialog: DialogComponent, label, variant }) => (
            <Card key={title} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {step}
                  </span>
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
              <CardFooter>
                <DialogComponent>
                  <Button variant={variant} className="w-full">{label}</Button>
                </DialogComponent>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Note about payment */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-[#f1c100]/15 border border-[#f1c100]/30 rounded-lg p-4 text-center">
            <p className="text-sm text-foreground/80">
              <span className="font-bold">Note:</span> Bank transfer details will be communicated
              by email after registration. Steps 2 and 3 can be completed in any order or at a later date.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
