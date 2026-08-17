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
import { ClipboardList, FileText, Landmark, LockKeyhole, Receipt } from "lucide-react"
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
  { date: "June 13, 2026", event: "Abstract submission deadline" },
  { date: "June 15, 2026", event: "Author notifications" },
  { date: "July 15, 2026", event: "Registration deadline" },
]

const actions = [
  {
    icon: ClipboardList,
    step: "Step 1",
    title: "Registration Closed",
    description: "The registration period ended on July 15, 2026. New registrations are no longer accepted.",
    dialog: null,
    label: "Registration Closed",
    variant: "outline" as const,
    closed: true,
  },
  {
    icon: FileText,
    step: "Step 2",
    title: "Abstract Submission Closed",
    description: "The abstract submission period ended on June 13, 2026. New submissions are no longer accepted.",
    dialog: null,
    label: "Submissions Closed",
    variant: "outline" as const,
    closed: true,
  },
  {
    icon: Receipt,
    step: "Step 3",
    title: "Upload Payment Receipt",
    description: "After completing your bank transfer, upload your proof of payment here.",
    dialog: PaymentReceiptDialog,
    label: "Upload Receipt",
    variant: "outline" as const,
    closed: false,
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
            Registration and abstract submission are now closed.
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
          {actions.map(({ icon: Icon, step, title, description, dialog: DialogComponent, label, variant, closed }) => (
            <Card
              key={title}
              className={`flex flex-col ${closed ? "border-primary/20 bg-secondary/35 shadow-none" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-lg shrink-0 ${closed ? "bg-primary/15" : "bg-primary/10"}`}>
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
                {closed ? (
                  <div
                    role="status"
                    className="flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary/[0.06] px-4 py-2 text-sm font-semibold text-primary"
                  >
                    <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </div>
                ) : DialogComponent ? (
                  <DialogComponent>
                    <Button variant={variant} className="w-full">{label}</Button>
                  </DialogComponent>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bank account details */}
        <div className="max-w-5xl mx-auto mt-8">
          <Card className="border-[#f1c100]/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#f1c100]/15 shrink-0">
                  <Landmark className="h-4 w-4 text-[#f1c100]" />
                </div>
                <CardTitle className="text-base">Bank Account Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Payment of the registration fee should be made to the following account:
              </p>
              <dl className="space-y-3 text-sm">
                <div className="sm:grid sm:grid-cols-[7rem_1fr] sm:gap-x-6">
                  <dt className="font-medium text-muted-foreground">Name</dt>
                  <dd className="text-foreground">
                    Special Account for Research Grants of the National and Kapodistrian University of Athens
                  </dd>
                </div>
                <div className="sm:grid sm:grid-cols-[7rem_1fr] sm:gap-x-6">
                  <dt className="font-medium text-muted-foreground">Bank</dt>
                  <dd className="text-foreground">ALPHA BANK S.A.</dd>
                </div>
                <div className="sm:grid sm:grid-cols-[7rem_1fr] sm:gap-x-6">
                  <dt className="font-medium text-muted-foreground">IBAN</dt>
                  <dd className="font-mono text-foreground">GR16 0140 8020 8020 0200 1001 836</dd>
                </div>
                <div className="sm:grid sm:grid-cols-[7rem_1fr] sm:gap-x-6">
                  <dt className="font-medium text-muted-foreground">Swift/BIC</dt>
                  <dd className="font-mono text-foreground">CRBAGRAA</dd>
                </div>
              </dl>
              <div className="bg-[#f1c100]/15 border border-[#f1c100]/30 rounded-lg p-3">
                <p className="text-sm text-foreground/80">
                  <span className="font-bold">Note:</span> Your bank transfer receipt should include
                  your surname and registration type (e.g. Regular, Student, etc.).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
