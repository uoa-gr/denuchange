import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, ExternalLink } from "lucide-react"

const links = [
  {
    label: "IAG Official Website",
    url: "https://www.geomorph.org/",
  },
  {
    label: "DENUCHANGE Working Group",
    url: "https://www.geomorph.org/denuchange-working-group-4/",
  },
  {
    label: "NKUA",
    url: "https://en.uoa.gr/",
  },
]

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
                Prof. Niki Evelpidou
              </h3>
              <p className="text-muted-foreground mb-1">
                Workshop Chair
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Faculty of Geology & Geoenvironment<br />
                National and Kapodistrian University of Athens
              </p>

              <Button asChild>
                <a href="mailto:evliepi@geol.uoa.gr">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Workshop Chair
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Useful Links */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-lg border bg-background hover:bg-accent transition-colors text-sm"
              >
                {link.label}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

