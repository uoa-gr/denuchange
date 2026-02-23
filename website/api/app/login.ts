import bcrypt from "bcryptjs"
import { supabaseAdmin } from "../_lib/supabase-admin"
import { signJwt, getSessionCookie } from "../_lib/auth"

// POST /api/app/login
// { email, password } → AppUser (sets HttpOnly session cookie)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const email: string = (req.body?.email ?? "").toString().trim().toLowerCase()
  const password: string = (req.body?.password ?? "").toString()

  if (!email || !password) return res.status(400).json({ error: "Email and password are required" })

  // Fetch user record
  const { data: user } = await supabaseAdmin
    .from("app_users")
    .select("email, password_hash, is_admin, avatar_path")
    .eq("email", email)
    .maybeSingle()

  if (!user || !user.password_hash) {
    // Constant-time-ish response to prevent user enumeration
    await bcrypt.hash("dummy", 12)
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: "Invalid credentials" })

  // Fetch name and affiliation from registrations
  const { data: reg } = await supabaseAdmin
    .from("registrations")
    .select("first_name, last_name, affiliation")
    .eq("email", email)
    .single()

  const token = signJwt({ email: user.email, isAdmin: user.is_admin })
  res.setHeader("Set-Cookie", getSessionCookie(token))

  return res.json({
    email: user.email,
    isAdmin: user.is_admin,
    firstName: reg?.first_name ?? "",
    lastName: reg?.last_name ?? "",
    affiliation: reg?.affiliation ?? "",
    avatarPath: user.avatar_path ?? null,
  })
}
