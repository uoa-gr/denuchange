import { useState } from "react"
import { fieldTripDays } from "@/lib/fieldtrip-data"
import { MapPin, ChevronRight, X, ImageOff } from "lucide-react"

type Stop = (typeof fieldTripDays)[number]["stops"][number]

export function FieldTripPage() {
  const [activeDay, setActiveDay] = useState(0)
  const [selected, setSelected] = useState<Stop | null>(null)
  const [imgIndex, setImgIndex] = useState(0)

  const dayData = fieldTripDays[activeDay]

  return (
    <div className="flex flex-col h-full">
      {/* Day tabs */}
      <div className="flex border-b border-border bg-background">
        {fieldTripDays.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(i)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeDay === i
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Day {d.day}
            <br />
            <span className="text-[10px] opacity-70">{d.weekday}</span>
          </button>
        ))}
      </div>

      {/* Theme banner */}
      <div className="px-4 py-2.5 bg-green-500/10 border-b border-border">
        <p className="text-xs text-green-700 font-medium">{dayData.theme} — {dayData.date}</p>
      </div>

      {/* Stops list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {dayData.stops.map((stop, idx) => (
          <button
            key={stop.id}
            onClick={() => { setSelected(stop); setImgIndex(0) }}
            className="w-full text-left rounded-xl border border-border bg-card shadow-sm overflow-hidden flex items-stretch"
          >
            <div className="flex-none bg-green-500/10 flex flex-col items-center justify-center w-10 shrink-0">
              <span className="text-[10px] font-bold text-green-700">{idx + 1}</span>
            </div>
            <div className="flex-1 min-w-0 px-3 py-3">
              <p className="text-sm font-semibold text-foreground">{stop.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{stop.shortDescription}</p>
            </div>
            <div className="flex-none flex items-center pr-3">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom sheet detail */}
      {selected && (
        <div className="absolute inset-0 z-30 bg-background flex flex-col" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <button
              onClick={() => setSelected(null)}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-foreground flex-1 truncate">{selected.name}</h2>
          </div>

          {/* Image carousel */}
          <div className="relative bg-muted aspect-[16/9] flex-none overflow-hidden">
            {selected.images.length > 0 ? (
              <>
                <img
                  src={selected.images[imgIndex]}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
                {selected.images.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {selected.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === imgIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <MapPin className="h-3.5 w-3.5" />
              <span>{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{selected.fullDescription}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              View on map
              <MapPin className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
