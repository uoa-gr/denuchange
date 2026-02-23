import { supabaseAdmin } from "../../_lib/supabase-admin"
import { extractJwt } from "../../_lib/auth"

// POST /api/app/admin/post-notification
// { title, body } → { ok: true }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const payload = extractJwt(req)
  if (!payload) return res.status(401).json({ error: "Unauthorized" })
  if (!payload.isAdmin) return res.status(403).json({ error: "Forbidden" })

  const title: string = (req.body?.title ?? "").toString().trim()
  const body: string = (req.body?.body ?? "").toString().trim()

  if (!title || !body) return res.status(400).json({ error: "Title and body are required" })
  if (title.length > 200) return res.status(400).json({ error: "Title too long" })
  if (body.length > 5000) return res.status(400).json({ error: "Body too long" })

  const { error } = await supabaseAdmin
    .from("notifications")
    .insert({ title, body, created_by: payload.email })

  if (error) {
    console.error("post-notification:", error)
    return res.status(500).json({ error: "Internal server error" })
  }

  return res.json({ ok: true })
}
