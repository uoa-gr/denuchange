import { useEffect, useState } from "react"
import type { GalleryMedia } from "../lib/workshop-gallery-data"

interface SharedImage {
  id: string
  file_path: string
  caption: string | null
  created_at: string
}

const PAGE_SIZE = 20

function toGalleryMedia(image: SharedImage, supabaseUrl: string): GalleryMedia {
  const filename = image.file_path.split("/").pop() || "workshop-photo.jpg"
  const path = image.file_path.split("/").map(encodeURIComponent).join("/")
  const url = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/gallery/${path}`

  return {
    id: image.id,
    kind: "photo",
    title: image.caption || "Workshop photo",
    filename,
    src: url,
    thumbnail: url,
    original: url,
    bytes: 0,
    width: 0,
    height: 0,
  }
}

export function SharedGallery({ onOpen }: { onOpen: (items: GalleryMedia[], index: number) => void }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  const isLocalPreview = !supabaseUrl || !supabaseKey
    || supabaseUrl.includes("local-gallery-preview")
    || supabaseKey.includes("local-gallery-preview")
    || supabaseUrl.includes("xxxxxxxx")
    || (import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "gallery")
  const [images, setImages] = useState<GalleryMedia[]>([])
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(!isLocalPreview)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLocalPreview || !supabaseUrl) return

    let ignore = false
    setLoading(true)
    setError(null)

    async function fetchPage() {
      try {
        const { supabase } = await import("@/lib/supabase")
        if (ignore) return

        const from = page * PAGE_SIZE
        const { data, error: fetchError } = await supabase
          .from("gallery_images")
          .select("id, file_path, caption, created_at")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(from, from + PAGE_SIZE - 1)

        if (ignore) return
        if (fetchError) throw fetchError

        const items = ((data ?? []) as SharedImage[]).map((image) => toGalleryMedia(image, supabaseUrl!))
        setImages((previous) => {
          if (page === 0) return items
          const knownIds = new Set(previous.map((image) => image.id))
          return [...previous, ...items.filter((image) => !knownIds.has(image.id))]
        })
        setHasMore(items.length === PAGE_SIZE)
      } catch {
        if (!ignore) setError("Participant photos could not be loaded. Please try again.")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void fetchPage()
    return () => { ignore = true }
  }, [page, attempt, isLocalPreview, supabaseUrl])

  if (isLocalPreview) {
    return (
      <p className="px-4 py-3 text-xs text-muted-foreground">
        Shared photos are available in the live app.
      </p>
    )
  }

  return (
    <div aria-busy={loading}>
      {images.length > 0 && (
        <div className="p-1 columns-2 sm:columns-3 gap-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="block w-full mb-1 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => onOpen(images, index)}
              aria-label={`Open ${image.title} in full view`}
            >
              <img
                src={image.thumbnail}
                alt={image.title}
                loading="lazy"
                decoding="async"
                className="w-full h-auto"
              />
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4" role="status" aria-label="Loading shared photos">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground" role="alert">{error}</p>
          <button type="button" className="mt-2 text-xs text-primary underline" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <p className="px-4 py-3 text-xs text-muted-foreground">No shared photos yet.</p>
      )}

      {!loading && !error && hasMore && images.length > 0 && (
        <div className="flex justify-center py-3">
          <button type="button" className="text-xs text-primary underline" onClick={() => setPage((value) => value + 1)}>
            Load more photos
          </button>
        </div>
      )}
    </div>
  )
}
