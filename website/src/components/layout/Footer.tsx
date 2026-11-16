import { useEffect, useState } from "react"

const VISIT_ENDPOINT = "https://evelpidou.nkua.cloud/api/visits/denuchange"
const VISIT_STORAGE_KEY = "denuchange-visit-counted-v1"

// The total of recorded page visits, or null until the counter answers. A browser session is
// counted once: its first request records the visit (POST), later requests only read the total
// (GET). The counter uses no cookies and stores only the total; when it cannot be reached the
// dash stays.
function useVisitCount(): number | null {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    let counted = false
    try {
      counted = window.sessionStorage.getItem(VISIT_STORAGE_KEY) === "yes"
    } catch {
      counted = false
    }

    fetch(VISIT_ENDPOINT, {
      method: counted ? "GET" : "POST",
      cache: "no-store",
      credentials: "omit",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((payload: { count?: unknown }) => {
        const total = Number(payload.count)
        if (!Number.isFinite(total) || total < 0) throw new Error("Invalid visit count")
        if (!counted) {
          try {
            window.sessionStorage.setItem(VISIT_STORAGE_KEY, "yes")
          } catch {
            // The counter still works when browser storage is unavailable.
          }
        }
        if (active) setCount(total)
      })
      .catch(() => {
        // The dash stays when the counter cannot be reached.
      })

    return () => {
      active = false
    }
  }, [])

  return count
}

export function Footer() {
  const visitCount = useVisitCount()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2026 IAG DENUCHANGE Working Group</p>
          <p className="mt-1">
            5th International Workshop · Naxos, Greece · October 5–9, 2026
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
          <p
            className="mt-3 text-xs"
            role="status"
            aria-live="polite"
            aria-describedby="visit-privacy"
          >
            Recorded page visits{" "}
            <span className="font-medium tabular-nums">
              {visitCount === null ? "—" : visitCount.toLocaleString("en")}
            </span>
          </p>
          <span id="visit-privacy" className="sr-only">
            The counter does not use cookies or collect information that can identify individual
            visitors. Only the aggregate visit count is stored.
          </span>
        </div>
      </div>
    </footer>
  )
}
