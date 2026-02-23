import { supabaseAdmin } from "../_lib/supabase-admin"

// GET /api/app/verify-setup-token?token=xxx
// Non-destructive — just checks validity
// → { valid: true, email } | { valid: false, reason }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const token: string = (req.query?.token ?? "").toString().trim()
  if (!token || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) {
    return res.json({ valid: false, reason: "Invalid token format" })
  }

  const { data } = await supabaseAdmin
    .from("password_setup_tokens")
    .select("email, expires_at, used_at")
    .eq("token", token)
    .maybeSingle()

  if (!data) return res.json({ valid: false, reason: "Token not found" })
  if (data.used_at) return res.json({ valid: false, reason: "Token already used" })
  if (new Date(data.expires_at) < new Date()) return res.json({ valid: false, reason: "Token expired" })

  return res.json({ valid: true, email: data.email })
}
