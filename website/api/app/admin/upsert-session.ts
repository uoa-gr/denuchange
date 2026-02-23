import { supabaseAdmin } from "../../_lib/supabase-admin"
import { extractJwt } from "../../_lib/auth"

type SessionType = "session" | "break" | "meal" | "keynote" | "field_trip" | "social"
const SESSION_TYPES: SessionType[] = ["session", "break", "meal", "keynote", "field_trip", "social"]

interface SessionInput {
  id?: string
  date: string
  start_time: string
  end_time: string
  title: string
  description?: string
  location?: string
  session_type?: string
}

// POST /api/app/admin/upsert-session
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const payload = extractJwt(req)
  if (!payload) return res.status(401).json({ error: "Unauthorized" })
  if (!payload.isAdmin) return res.status(403).json({ error: "Forbidden" })

  const body: SessionInput = req.body ?? {}
  const { id, date, start_time, end_time, title } = body
  const description = (body.description ?? "").toString().trim().slice(0, 2000)
  const location = (body.location ?? "").toString().trim().slice(0, 200)
  const session_type = SESSION_TYPES.includes(body.session_type as SessionType)
    ? body.session_type
    : "session"

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
  const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/
  if (!date || !DATE_RE.test(date)) return res.status(400).json({ error: "Invalid date" })
  if (!start_time || !TIME_RE.test(start_time)) return res.status(400).json({ error: "Invalid start_time" })
  if (!end_time || !TIME_RE.test(end_time)) return res.status(400).json({ error: "Invalid end_time" })
  if (!title || title.toString().trim().length === 0) return res.status(400).json({ error: "Title required" })

  const record = {
    date,
    start_time,
    end_time,
    title: title.toString().trim().slice(0, 300),
    description,
    location,
    session_type,
  }

  if (id) {
    // Validate UUID to prevent injection via id field
    if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(400).json({ error: "Invalid id" })
    const { error } = await supabaseAdmin
      .from("program_sessions")
      .update(record)
      .eq("id", id)

    if (error) {
      console.error("upsert-session update:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
    return res.json({ id })
  } else {
    const { data, error } = await supabaseAdmin
      .from("program_sessions")
      .insert(record)
      .select("id")
      .single()

    if (error || !data) {
      console.error("upsert-session insert:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
    return res.json({ id: data.id })
  }
}
