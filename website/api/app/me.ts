import { supabaseAdmin } from "../_lib/supabase-admin"
import { extractJwt } from "../_lib/auth"

// GET /api/app/me → AppUser (reads HttpOnly session cookie)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const payload = extractJwt(req)
  if (!payload) return res.status(401).json({ error: "Unauthorized" })

  const [{ data: user }, { data: reg }] = await Promise.all([
    supabaseAdmin
      .from("app_users")
      .select("email, is_admin, avatar_path")
      .eq("email", payload.email)
      .single(),
    supabaseAdmin
      .from("registrations")
      .select("first_name, last_name, affiliation, registration_type")
      .eq("email", payload.email)
      .single(),
  ])

  if (!user) return res.status(401).json({ error: "Unauthorized" })

  return res.json({
    email: user.email,
    isAdmin: user.is_admin,
    firstName: reg?.first_name ?? "",
    lastName: reg?.last_name ?? "",
    affiliation: reg?.affiliation ?? "",
    registrationType: reg?.registration_type ?? "",
    avatarPath: user.avatar_path ?? null,
  })
}
