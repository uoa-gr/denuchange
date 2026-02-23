import bcrypt from "bcryptjs"
import { supabaseAdmin } from "../_lib/supabase-admin"

// POST /api/app/set-password
// { token, password } → { ok: true }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const token: string = (req.body?.token ?? "").toString().trim()
  const password: string = (req.body?.password ?? "").toString()

  if (!token || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) {
    return res.status(400).json({ error: "Invalid token" })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" })
  }
  if (password.length > 128) {
    return res.status(400).json({ error: "Password too long" })
  }

  // Validate token
  const { data: tokenRow } = await supabaseAdmin
    .from("password_setup_tokens")
    .select("email, expires_at, used_at")
    .eq("token", token)
    .maybeSingle()

  if (!tokenRow) return res.status(400).json({ error: "Invalid token" })
  if (tokenRow.used_at) return res.status(400).json({ error: "Token already used" })
  if (new Date(tokenRow.expires_at) < new Date()) return res.status(400).json({ error: "Token expired" })

  // Hash password (cost 12)
  const passwordHash = await bcrypt.hash(password, 12)

  // Update app_users and mark token used in parallel
  const [{ error: updateErr }, { error: tokenErr }] = await Promise.all([
    supabaseAdmin
      .from("app_users")
      .update({ password_hash: passwordHash })
      .eq("email", tokenRow.email),
    supabaseAdmin
      .from("password_setup_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token),
  ])

  if (updateErr || tokenErr) {
    console.error("set-password:", updateErr ?? tokenErr)
    return res.status(500).json({ error: "Internal server error" })
  }

  return res.json({ ok: true })
}
