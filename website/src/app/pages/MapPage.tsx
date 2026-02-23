import { useCallback, useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { pois, POI_CATEGORY_LABELS, type PoiCategory } from "@/app/lib/map-data"
import { ExternalLink, X } from "lucide-react"

const ALL_CATEGORIES = Object.keys(POI_CATEGORY_LABELS) as PoiCategory[]

const CATEGORY_CHIP_COLORS: Record<PoiCategory, string> = {
  venue: "bg-primary text-primary-foreground",
  hotel: "bg-blue-500 text-white",
  transport: "bg-amber-500 text-white",
  beach: "bg-cyan-500 text-white",
  restaurant: "bg-orange-500 text-white",
  field_trip: "bg-green-600 text-white",
}

const DOT_COLORS: Record<PoiCategory, string> = {
  venue: "#074F6A",
  hotel: "#3b82f6",
  transport: "#f59e0b",
  beach: "#06b6d4",
  restaurant: "#f97316",
  field_trip: "#16a34a",
}

interface SelectedPoi {
  id: string
  name: string
  description?: string
  category: PoiCategory
  lng: number
  lat: number
}

export function MapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [activeCategories, setActiveCategories] = useState<Set<PoiCategory>>(
    new Set(ALL_CATEGORIES)
  )
  const [selected, setSelected] = useState<SelectedPoi | null>(null)

  const toggleCategory = useCallback((cat: PoiCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [25.38, 37.105],
      zoom: 12,
    })
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right")
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Re-render markers when active categories change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add markers for active pois
    const visible = pois.filter((p) => activeCategories.has(p.category))
    visible.forEach((poi) => {
      const el = document.createElement("div")
      el.style.cssText = `
        width:14px;height:14px;border-radius:50%;
        background:${DOT_COLORS[poi.category]};
        border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,0.35);
        cursor:pointer;
      `
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.lng, poi.lat])
        .addTo(map)

      el.addEventListener("click", (e) => {
        e.stopPropagation()
        setSelected({
          id: poi.id,
          name: poi.name,
          description: poi.description,
          category: poi.category,
          lng: poi.lng,
          lat: poi.lat,
        })
      })

      markersRef.current.push(marker)
    })
  }, [activeCategories])

  const mapsUrl = selected
    ? `https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`
    : "#"

  return (
    <div className="relative flex flex-col h-full">
      {/* Category filter chips */}
      <div className="absolute top-2 left-0 right-0 z-10 px-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ALL_CATEGORIES.map((cat) => {
            const active = activeCategories.has(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex-none text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                  active
                    ? CATEGORY_CHIP_COLORS[cat]
                    : "bg-background/90 text-muted-foreground border-border"
                }`}
              >
                {POI_CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Map */}
      <div ref={containerRef} className="flex-1" />

      {/* Bottom sheet for selected POI */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-background rounded-t-2xl shadow-2xl border-t border-border p-5 pb-safe animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span
                className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-1.5 ${CATEGORY_CHIP_COLORS[selected.category]}`}
              >
                {POI_CATEGORY_LABELS[selected.category]}
              </span>
              <p className="text-base font-bold text-foreground">{selected.name}</p>
              {selected.description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {selected.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex-none p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Open in Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  )
}
