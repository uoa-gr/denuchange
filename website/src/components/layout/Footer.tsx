export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
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
              className="underline hover:text-foreground transition-colors cursor-pointer"
            >
              Alexandros Liaskos
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
