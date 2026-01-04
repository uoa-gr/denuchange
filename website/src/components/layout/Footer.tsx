import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        {/* Logos */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          <a
            href="https://www.geomorph.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            <img
              src="/images/logo-iag.jpg"
              alt="IAG - International Association of Geomorphologists"
              className="h-12 object-contain"
            />
          </a>
          <a
            href="https://www.geomorph.org/denuchange-working-group-4/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            <img
              src="/images/logo-denuchange.jpg"
              alt="DENUCHANGE Working Group"
              className="h-12 object-contain rounded-full"
            />
          </a>
          <a
            href="https://en.uoa.gr/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            <img
              src="/images/logo-nkua.jpg"
              alt="National and Kapodistrian University of Athens"
              className="h-12 object-contain"
            />
          </a>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2026 IAG DENUCHANGE Working Group</p>
          <p className="mt-1">
            5th International Workshop · Naxos, Greece · October 6-9, 2026
          </p>
        </div>
      </div>
    </footer>
  )
}

