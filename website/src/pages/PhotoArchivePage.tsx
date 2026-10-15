import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { WorkshopGallery } from "../app/pages/Gallery"

export function PhotoArchivePage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = "Workshop Photo Archive | IAG DENUCHANGE 2026"
    return () => { document.title = previousTitle }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-5xl px-4 pt-6 pb-5 sm:px-6 sm:pt-8 sm:pb-6">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to workshop
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Workshop Photo Archive</h1>
      </header>
      <main className="pb-8">
        <WorkshopGallery />
      </main>
    </div>
  )
}
