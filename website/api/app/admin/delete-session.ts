import { supabaseAdmin } from "../../_lib/supabase-admin"
import { extractJwt } from "../../_lib/auth"

// DELETE /api/app/admin/delete-session
// { id } → { ok: true }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" })

  const payload = extractJwt(req)
  if (!payload) return res.status(401).json({ error: "Unauthorized" })
  if (!payload.isAdmin) return res.status(403).json({ error: "Forbidden" })

  const id: string = (req.body?.id ?? "").toString().trim()
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return res.status(400).json({ error: "Invalid id" })

  const { error } = await supabaseAdmin.from("program_sessions").delete().eq("id", id)
  if (error) {
    console.error("delete-session:", error)
    return res.status(500).json({ error: "Internal server error" })
  }

  return res.json({ ok: true })
}
