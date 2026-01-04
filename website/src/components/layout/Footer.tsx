import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        {/* Organization Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <a
            href="https://www.geomorph.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/logo-iag.jpg`}
              alt="IAG"
              className="h-10 w-10 object-contain flex-shrink-0"
              loading="lazy"
            />
            <div className="text-left">
              <p className="text-sm font-medium">IAG</p>
              <p className="text-xs text-muted-foreground">International Association of Geomorphologists</p>
            </div>
          </a>
          <a
            href="https://www.geomorph.org/denuchange-working-group-4/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/logo-denuchange.jpg`}
              alt="DENUCHANGE"
              className="h-10 w-10 object-contain rounded-full flex-shrink-0"
              loading="lazy"
            />
            <div className="text-left">
              <p className="text-sm font-medium">DENUCHANGE</p>
              <p className="text-xs text-muted-foreground">IAG Working Group</p>
            </div>
          </a>
          <a
            href="https://en.uoa.gr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/logo-nkua.jpg`}
              alt="NKUA"
              className="h-10 w-10 object-contain flex-shrink-0"
              loading="lazy"
            />
            <div className="text-left">
              <p className="text-sm font-medium">NKUA</p>
              <p className="text-xs text-muted-foreground">National & Kapodistrian University of Athens</p>
            </div>
          </a>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2026 IAG DENUCHANGE Working Group</p>
          <p className="mt-1">
            5th International Workshop · Naxos, Greece · October 6-9, 2026
          </p>
          <p className="mt-3 text-xs">
            Developed by{" "}
            <a
              href="mailto:alexliaskos@geol.uoa.gr"
              className="underline hover:text-foreground transition-colors"
            >
              Alexandros Liaskos
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
