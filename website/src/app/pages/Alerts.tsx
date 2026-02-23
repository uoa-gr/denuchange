import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  title: string
  body: string
  created_at: string
}

const STORAGE_KEY = "denuchange_read_notifications"

function getReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}

function markRead(ids: string[]) {
  const s = getReadSet()
  ids.forEach((id) => s.add(id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]))
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function AlertsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const readSet = useRef(getReadSet())

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, created_at")
        .order("created_at", { ascending: false })
      const notifications = data ?? []
      setItems(notifications)
      markRead(notifications.map((n) => n.id))
      readSet.current = getReadSet()
      setLoading(false)
    })()

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as Notification
          setItems((prev) => [n, ...prev])
          // Don't auto-mark new ones so they appear unread briefly
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <Bell className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No announcements yet</p>
        <p className="text-xs text-muted-foreground">
          Real-time alerts will appear here during the workshop.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {items.map((n) => {
        const isUnread = !readSet.current.has(n.id)
        return (
          <div
            key={n.id}
            className={`px-4 py-4 ${isUnread ? "bg-primary/5" : "bg-background"}`}
            onClick={() => {
              markRead([n.id])
              readSet.current.add(n.id)
            }}
          >
            <div className="flex items-start gap-3">
              {isUnread && (
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-none" />
              )}
              {!isUnread && <span className="mt-1.5 h-2 w-2 flex-none" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[11px] text-muted-foreground mt-1.5">{timeAgo(n.created_at)}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
