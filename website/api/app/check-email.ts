import { supabaseAdmin } from "../_lib/supabase-admin"

// POST /api/app/check-email
// { email } → { status: "not_registered" | "needs_password" | "has_password" }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const raw: string = (req.body?.email ?? "").toString().trim().toLowerCase()
  if (!raw || raw.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  // 1. Check registration exists
  const { data: reg } = await supabaseAdmin
    .from("registrations")
    .select("email")
    .ilike("email", raw)
    .maybeSingle()

  if (!reg) {
    return res.json({ status: "not_registered" })
  }

  // Normalise to actual stored email casing
  const email: string = reg.email

  // 2. Upsert app_users row (creates it lazily on first check)
  const { error: upsertError } = await supabaseAdmin
    .from("app_users")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true })

  if (upsertError) {
    console.error("upsert app_users:", upsertError)
    return res.status(500).json({ error: "Internal server error" })
  }

  // 3. Read whether a password has been set
  const { data: user } = await supabaseAdmin
    .from("app_users")
    .select("password_hash")
    .eq("email", email)
    .single()

  const status = user?.password_hash ? "has_password" : "needs_password"
  return res.json({ status })
}
