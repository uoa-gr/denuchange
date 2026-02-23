import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Search, Users } from "lucide-react"

interface Participant {
  first_name: string
  last_name: string
  affiliation: string | null
  country: string | null
}

export function Participants() {
  const [all, setAll] = useState<Participant[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("registrations")
        .select("first_name, last_name, affiliation, country")
        .order("last_name")
      setAll(data ?? [])
      setLoading(false)
    })()
  }, [])

  const filtered = query.trim()
    ? all.filter((p) => {
        const q = query.toLowerCase()
        return (
          p.first_name.toLowerCase().includes(q) ||
          p.last_name.toLowerCase().includes(q) ||
          p.affiliation?.toLowerCase().includes(q) ||
          false
        )
      })
    : all

  // Group by first letter of last name
  const groups: Map<string, Participant[]> = new Map()
  filtered.forEach((p) => {
    const letter = (p.last_name?.[0] ?? "#").toUpperCase()
    const arr = groups.get(letter) ?? []
    arr.push(p)
    groups.set(letter, arr)
  })

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 bg-background border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or affiliation…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2 border-b border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">
          {loading ? "Loading…" : `${filtered.length} participant${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No participants found</p>
          </div>
        ) : (
          [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([letter, people]) => (
            <div key={letter}>
              <div className="sticky top-0 bg-muted/70 backdrop-blur-sm px-4 py-1 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground">{letter}</p>
              </div>
              {people.map((p, i) => (
                <div
                  key={`${p.last_name}-${p.first_name}-${i}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border/50"
                >
                  <div className="flex-none h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {p.first_name?.[0]?.toUpperCase() ?? "?"}
                      {p.last_name?.[0]?.toUpperCase() ?? ""}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {p.first_name} {p.last_name}
                    </p>
                    {(p.affiliation || p.country) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {[p.affiliation, p.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
