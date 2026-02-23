import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/app/lib/auth"
import { api, type SessionInput } from "@/app/lib/api"
import { supabase } from "@/lib/supabase"
import { Bell, Image, Calendar, Trash2, Pencil, Plus, X } from "lucide-react"

type Tab = "alerts" | "gallery" | "program"

interface ProgramSession {
  id: string
  date: string
  start_time: string
  end_time: string
  title: string
  description: string
  location: string
  session_type: string
}

const SESSION_TYPES = ["session", "keynote", "break", "meal", "field_trip", "social"] as const

// ── Alerts tab ──────────────────────────────────────────────────────────────

function AlertsTab() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSend() {
    if (!title.trim() || !body.trim()) return
    setSending(true)
    setError("")
    try {
      await api.adminPostNotification(title.trim(), body.trim())
      setSent(true)
      setTitle("")
      setBody("")
      setTimeout(() => setSent(false), 3000)
    } catch {
      setError("Failed to send notification.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-muted-foreground">
        Sends a real-time alert to all participants in the app.
      </p>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Room change"
          className="w-full px-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Write your announcement…"
          className="w-full px-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {sent && <p className="text-xs text-green-600">Notification sent!</p>}
      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send notification"}
      </button>
    </div>
  )
}

// ── Gallery tab ─────────────────────────────────────────────────────────────

function GalleryTab() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    setUploading(true)
    setError("")
    try {
      const { token, path, mimeType } = await api.adminGetGalleryUploadUrl(ext, caption.trim())
      await supabase.storage.from("gallery").uploadToSignedUrl(path, token, file, {
        contentType: mimeType,
        upsert: false,
      })
      setDone(true)
      setCaption("")
      if (fileInputRef.current) fileInputRef.current.value = ""
      setTimeout(() => setDone(false), 3000)
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-muted-foreground">Add photos to the participant gallery.</p>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Photo</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-muted file:text-xs file:font-medium"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">
          Caption <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Describe the photo…"
          className="w-full px-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {done && <p className="text-xs text-green-600">Photo uploaded!</p>}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload photo"}
      </button>
    </div>
  )
}

// ── Program tab ─────────────────────────────────────────────────────────────

const EMPTY_SESSION: Omit<SessionInput, "id"> = {
  date: "2026-10-06",
  start_time: "09:00",
  end_time: "10:00",
  title: "",
  description: "",
  location: "",
  session_type: "session",
}

function ProgramTab() {
  const [sessions, setSessions] = useState<ProgramSession[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<SessionInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("program_sessions")
        .select("*")
        .order("date")
        .order("start_time")
      setSessions((data ?? []) as ProgramSession[])
      setLoading(false)
    })()
  }, [])

  async function handleSave() {
    if (!editing || !editing.title.trim()) return
    setSaving(true)
    setError("")
    try {
      const { id } = await api.adminUpsertSession(editing)
      setSessions((prev) => {
        const updated: ProgramSession = { ...(editing as unknown as ProgramSession), id }
        const idx = prev.findIndex((s) => s.id === id)
        return idx >= 0 ? prev.map((s) => (s.id === id ? updated : s)) : [...prev, updated]
      })
      setEditing(null)
    } catch {
      setError("Failed to save session.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this session?")) return
    try {
      await api.adminDeleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      alert("Failed to delete session.")
    }
  }

  function handleFieldChange(field: keyof SessionInput, value: string) {
    setEditing((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  if (editing !== null) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-foreground">
            {editing.id ? "Edit session" : "Add session"}
          </p>
          <button onClick={() => setEditing(null)} className="p-1 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        {(["date", "start_time", "end_time", "title", "location"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs font-medium text-foreground mb-1 capitalize">
              {field.replace("_", " ")}
            </label>
            <input
              type={field === "date" ? "date" : field.includes("time") ? "time" : "text"}
              value={(editing[field] as string) ?? ""}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Type</label>
          <select
            value={editing.session_type}
            onChange={(e) => handleFieldChange("session_type", e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={editing.description ?? ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving || !editing.title.trim()}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save session"}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <button
          onClick={() => setEditing({ ...EMPTY_SESSION })}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add session
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4">No sessions yet.</p>
      ) : (
        <div className="overflow-y-auto divide-y divide-border">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-start gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{s.date} · {s.start_time}–{s.end_time}</p>
                <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{s.session_type}</p>
              </div>
              <div className="flex gap-2 flex-none">
                <button
                  onClick={() => setEditing({ ...s })}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 rounded-lg hover:bg-muted text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function AdminPanel() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("alerts")

  useEffect(() => {
    if (!isLoading && user && !user.isAdmin) {
      navigate("/app", { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading || !user) return null

  const TABS: { key: Tab; label: string; Icon: typeof Bell }[] = [
    { key: "alerts", label: "Alerts", Icon: Bell },
    { key: "gallery", label: "Gallery", Icon: Image },
    { key: "program", label: "Program", Icon: Calendar },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Sub tabs */}
      <div className="flex border-b border-border bg-background">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-medium border-b-2 gap-1 transition-colors ${
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "alerts" && <AlertsTab />}
        {tab === "gallery" && <GalleryTab />}
        {tab === "program" && <ProgramTab />}
      </div>
    </div>
  )
}
