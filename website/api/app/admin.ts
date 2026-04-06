import { getSupabaseAdmin } from "../_lib/supabase-admin"
import { extractJwt } from "../_lib/auth"

// Consolidated admin handler (all routes require is_admin)
// POST   ?action=notify          → post notification
// POST   ?action=upsert-session  → insert or update program session
// DELETE ?action=delete-session  → delete program session

type SessionType = "session" | "break" | "meal" | "keynote" | "field_trip" | "social"
const SESSION_TYPES: SessionType[] = ["session", "break", "meal", "keynote", "field_trip", "social"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  try {
    return await _handle(req, res)
  } catch (err) {
    console.error("[admin]", err)
    if (!res.headersSent) res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _handle(req: any, res: any) {
  const action: string = (req.query?.action ?? "").toString()

  const payload = extractJwt(req)
  if (!payload) return res.status(401).json({ error: "Unauthorized" })
  if (!payload.isAdmin) return res.status(403).json({ error: "Forbidden" })

  if (req.method === "POST" && action === "notify") {
    const title: string = (req.body?.title ?? "").toString().trim()
    const body: string = (req.body?.body ?? "").toString().trim()
    if (!title || !body) return res.status(400).json({ error: "Title and body are required" })
    if (title.length > 200) return res.status(400).json({ error: "Title too long" })
    if (body.length > 5000) return res.status(400).json({ error: "Body too long" })

    const { error } = await getSupabaseAdmin()
      .from("notifications")
      .insert({ title, body, created_by: payload.email })
    if (error) {
      console.error("post-notification:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
    return res.json({ ok: true })
  }

  if (req.method === "POST" && action === "upsert-session") {
    const b = req.body ?? {}
    const { id, date, start_time, end_time, title } = b
    const description = (b.description ?? "").toString().trim().slice(0, 2000)
    const location = (b.location ?? "").toString().trim().slice(0, 200)
    const session_type = SESSION_TYPES.includes(b.session_type as SessionType) ? b.session_type : "session"

    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
    const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/
    if (!date || !DATE_RE.test(date)) return res.status(400).json({ error: "Invalid date" })
    if (!start_time || !TIME_RE.test(start_time)) return res.status(400).json({ error: "Invalid start_time" })
    if (!end_time || !TIME_RE.test(end_time)) return res.status(400).json({ error: "Invalid end_time" })
    if (!title || title.toString().trim().length === 0) return res.status(400).json({ error: "Title required" })

    const record = {
      date, start_time, end_time,
      title: title.toString().trim().slice(0, 300),
      description, location, session_type,
    }

    if (id) {
      if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(400).json({ error: "Invalid id" })
      const { error } = await getSupabaseAdmin().from("program_sessions").update(record).eq("id", id)
      if (error) {
        console.error("upsert-session update:", error)
        return res.status(500).json({ error: "Internal server error" })
      }
      return res.json({ id })
    } else {
      const { data, error } = await getSupabaseAdmin()
        .from("program_sessions").insert(record).select("id").single()
      if (error || !data) {
        console.error("upsert-session insert:", error)
        return res.status(500).json({ error: "Internal server error" })
      }
      return res.json({ id: data.id })
    }
  }

  if (req.method === "DELETE" && action === "delete-session") {
    const id: string = (req.body?.id ?? "").toString().trim()
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) return res.status(400).json({ error: "Invalid id" })
    const { error } = await getSupabaseAdmin().from("program_sessions").delete().eq("id", id)
    if (error) {
      console.error("delete-session:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
    return res.json({ ok: true })
  }

  if (req.method === "GET" && action === "ops-data") {
    const sb = getSupabaseAdmin()
    const [regs, abs, pays] = await Promise.all([
      sb.from("registrations").select("*").order("created_at", { ascending: false }),
      sb.from("abstracts").select("*").order("created_at", { ascending: false }),
      sb.from("payment_receipts").select("*").order("created_at", { ascending: false }),
    ])
    if (regs.error || abs.error || pays.error) {
      console.error("ops-data:", regs.error ?? abs.error ?? pays.error)
      return res.status(500).json({ error: "Failed to fetch data" })
    }
    return res.json({
      registrations: regs.data ?? [],
      abstracts: abs.data ?? [],
      payment_receipts: pays.data ?? [],
    })
  }

  return res.status(404).json({ error: "Unknown action" })
}
