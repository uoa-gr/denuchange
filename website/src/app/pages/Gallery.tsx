import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ImageOff, X, ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryImage {
  id: string
  file_path: string
  caption: string | null
  created_at: string
}

const PAGE_SIZE = 20

function publicUrl(path: string) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`
}

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const pageRef = useRef(0)
  const sentinel = useRef<HTMLDivElement | null>(null)

  const fetchPage = async () => {
    if (!hasMore) return
    const from = pageRef.current * PAGE_SIZE
    const { data } = await supabase
      .from("gallery_images")
      .select("id, file_path, caption, created_at")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (data) {
      setImages((prev) => [...prev, ...data])
      if (data.length < PAGE_SIZE) setHasMore(false)
      pageRef.current += 1
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchPage()
    })
    obs.observe(el)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading])

  const prev = () => setLightbox((i) => (i !== null && i > 0 ? i - 1 : i))
  const next = () => setLightbox((i) => (i !== null && i < images.length - 1 ? i + 1 : i))

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!loading && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <ImageOff className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Gallery coming soon</p>
        <p className="text-xs text-muted-foreground">Photos from the workshop will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-1 columns-2 sm:columns-3 gap-1 overflow-y-auto">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setLightbox(idx)}
            className="block w-full mb-1 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={publicUrl(img.file_path)}
              alt={img.caption ?? "Gallery photo"}
              loading="lazy"
              className="w-full h-auto object-cover"
            />
          </button>
        ))}
        <div ref={sentinel} className="h-4 w-full col-span-full" />
        {loading && (
          <div className="col-span-full flex justify-center py-4">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setLightbox(null)}
        >
          <div className="flex items-center justify-between px-4 pt-safe pt-4">
            <span className="text-xs text-white/70">
              {lightbox + 1} / {images.length}
            </span>
            <button
              onClick={() => setLightbox(null)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <div
            className="flex-1 flex items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={prev}
              disabled={lightbox === 0}
              className="absolute left-2 p-2 rounded-full bg-black/40 text-white disabled:opacity-20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <img
              src={publicUrl(images[lightbox].file_path)}
              alt={images[lightbox].caption ?? "Gallery photo"}
              className="max-h-full max-w-full object-contain px-12"
            />
            <button
              onClick={next}
              disabled={lightbox === images.length - 1}
              className="absolute right-2 p-2 rounded-full bg-black/40 text-white disabled:opacity-20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          {images[lightbox].caption && (
            <div className="pb-safe pb-6 px-6 text-center">
              <p className="text-sm text-white/80">{images[lightbox].caption}</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
