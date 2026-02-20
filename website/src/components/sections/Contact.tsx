import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Contact
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground">
            For inquiries about the workshop, please contact the organizing committee.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-lg font-semibold mb-2">
                Contact Us
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Faculty of Geology & Geoenvironment<br />
                National and Kapodistrian University of Athens
              </p>

              <Button asChild>
                <a href={`mailto:denuchange.workshop.2026@gmail.com?subject=${encodeURIComponent('DENUCHANGE Workshop 2026 – Inquiry')}&body=${encodeURIComponent('Topic: [ Registration / Abstract / Field Trip / Travel / Accommodation / Other ]\n\nYour name: \n\nYour email: \n\nMessage:\n\n')}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
