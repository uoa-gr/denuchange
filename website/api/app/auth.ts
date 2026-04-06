import crypto from "crypto"
import bcrypt from "bcryptjs"
import { getSupabaseAdmin } from "../_lib/supabase-admin"
import { signJwt, getSessionCookie, clearSessionCookie, extractJwt } from "../_lib/auth"
import { esc, sendMail, wrapEmail } from "../_lib/email"

// Consolidated auth handler
// GET  ?action=me           → return current user
// GET  ?action=verify       → verify setup token (&token=xxx)
// POST ?action=check        → check-email
// POST ?action=send-setup   → send-setup-email
// POST ?action=set-password → set-password
// POST ?action=login        → login
// POST ?action=logout       → logout

const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://denuchange.vercel.app"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  try {
    return await _handle(req, res)
  } catch (err) {
    console.error("[auth]", err)
    if (!res.headersSent) res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _handle(req: any, res: any) {
  const action: string = (req.query?.action ?? "").toString()

  // ── GET routes ─────────────────────────────────────────────────────────────

  if (req.method === "GET" && action === "me") {
    const payload = extractJwt(req)
    if (!payload) return res.status(401).json({ error: "Unauthorized" })

    const [{ data: user }, { data: reg }] = await Promise.all([
      getSupabaseAdmin()
        .from("app_users")
        .select("email, is_admin, avatar_path")
        .ilike("email", payload.email)
        .maybeSingle(),
      getSupabaseAdmin()
        .from("registrations")
        .select("first_name, last_name, affiliation, registration_type")
        .ilike("email", payload.email)
        .maybeSingle(),
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

  if (req.method === "GET" && action === "verify") {
    const token: string = (req.query?.token ?? "").toString().trim()
    if (!token || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) {
      return res.json({ valid: false, reason: "Invalid token format" })
    }
    const { data } = await getSupabaseAdmin()
      .from("password_setup_tokens")
      .select("email, expires_at, used_at")
      .eq("token", token)
      .maybeSingle()
    if (!data) return res.json({ valid: false, reason: "Token not found" })
    if (data.used_at) return res.json({ valid: false, reason: "Token already used" })
    if (new Date(data.expires_at) < new Date()) return res.json({ valid: false, reason: "Token expired" })
    return res.json({ valid: true, email: data.email })
  }

  // ── POST routes ────────────────────────────────────────────────────────────

  if (req.method === "POST" && action === "check") {
    const raw: string = (req.body?.email ?? "").toString().trim().toLowerCase()
    if (!raw || raw.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      return res.status(400).json({ error: "Invalid email address" })
    }
    const { data: reg } = await getSupabaseAdmin()
      .from("registrations")
      .select("email")
      .ilike("email", raw)
      .maybeSingle()
    if (!reg) return res.json({ status: "not_registered" })

    // Always store app_users.email in lowercase so lookups from all the other
    // endpoints (which lowercase their input) match unconditionally.
    const email: string = raw
    await getSupabaseAdmin()
      .from("app_users")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true })
    const { data: appUser } = await getSupabaseAdmin()
      .from("app_users")
      .select("password_hash")
      .ilike("email", email)
      .maybeSingle()
    return res.json({ status: appUser?.password_hash ? "has_password" : "needs_password" })
  }

  if (req.method === "POST" && action === "send-setup") {
    const email: string = (req.body?.email ?? "").toString().trim().toLowerCase()
    if (!email || email.length > 254) return res.status(400).json({ error: "Invalid email" })

    const { data: user } = await getSupabaseAdmin()
      .from("app_users")
      .select("email")
      .ilike("email", email)
      .maybeSingle()
    if (!user) return res.status(404).json({ error: "User not found" })

    const { data: recent } = await getSupabaseAdmin()
      .from("password_setup_tokens")
      .select("created_at")
      .ilike("email", email)
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recent) {
      const ageMs = Date.now() - new Date(recent.created_at).getTime()
      if (ageMs < 30_000) {
        return res.status(429).json({ error: "Too many requests", retryAfter: Math.ceil((30_000 - ageMs) / 1000) })
      }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { error: insertErr } = await getSupabaseAdmin()
      .from("password_setup_tokens")
      .insert({ email, token, expires_at: expiresAt })
    if (insertErr) {
      console.error("insert token:", insertErr)
      return res.status(500).json({ error: "Internal server error" })
    }

    const setupLink = `${APP_BASE_URL}/app/set-password?token=${token}`
    await sendMail(
      email,
      "Set Your Password – DENUCHANGE 2026 App",
      wrapEmail(`
        <h2 style="margin:0 0 8px;font-size:16px;color:#111827;">Create Your App Password</h2>
        <p style="color:#374151;line-height:1.6;">
          Click the button below to set your password for the
          <strong>IAG DENUCHANGE 2026 Attendee App</strong>.
          This link expires in <strong>24 hours</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr><td align="center">
            <a href="${esc(setupLink)}"
              style="display:inline-block;background:#074F6A;color:#ffffff;font-weight:600;
                     font-size:15px;padding:13px 28px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
              Create Password
            </a>
          </td></tr>
        </table>
        <p style="color:#6b7280;font-size:12px;word-break:break-all;">Or copy: ${esc(setupLink)}</p>
      `)
    )
    return res.json({ sent: true })
  }

  if (req.method === "POST" && action === "set-password") {
    const token: string = (req.body?.token ?? "").toString().trim()
    const password: string = (req.body?.password ?? "").toString()
    if (!token || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) {
      return res.status(400).json({ error: "Invalid token" })
    }
    if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" })
    if (password.length > 128) return res.status(400).json({ error: "Password too long" })

    const { data: tokenRow } = await getSupabaseAdmin()
      .from("password_setup_tokens")
      .select("email, expires_at, used_at")
      .eq("token", token)
      .maybeSingle()
    if (!tokenRow) return res.status(400).json({ error: "Invalid token" })
    if (tokenRow.used_at) return res.status(400).json({ error: "Token already used" })
    if (new Date(tokenRow.expires_at) < new Date()) return res.status(400).json({ error: "Token expired" })

    const passwordHash = await bcrypt.hash(password, 12)
    const [{ error: updateErr }, { error: tokenErr }] = await Promise.all([
      getSupabaseAdmin().from("app_users").update({ password_hash: passwordHash }).ilike("email", tokenRow.email),
      getSupabaseAdmin().from("password_setup_tokens").update({ used_at: new Date().toISOString() }).eq("token", token),
    ])
    if (updateErr || tokenErr) {
      console.error("set-password:", updateErr ?? tokenErr)
      return res.status(500).json({ error: "Internal server error" })
    }
    return res.json({ ok: true })
  }

  if (req.method === "POST" && action === "login") {
    const email: string = (req.body?.email ?? "").toString().trim().toLowerCase()
    const password: string = (req.body?.password ?? "").toString()
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" })

    const { data: user } = await getSupabaseAdmin()
      .from("app_users")
      .select("email, password_hash, is_admin, avatar_path")
      .ilike("email", email)
      .maybeSingle()
    if (!user || !user.password_hash) {
      await bcrypt.hash("dummy", 12)
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: "Invalid credentials" })

    const { data: reg } = await getSupabaseAdmin()
      .from("registrations")
      .select("first_name, last_name, affiliation, registration_type")
      .ilike("email", email)
      .maybeSingle()

    const jwtToken = signJwt({ email: user.email.toLowerCase(), isAdmin: user.is_admin })
    res.setHeader("Set-Cookie", getSessionCookie(jwtToken))
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

  if (req.method === "POST" && action === "logout") {
    res.setHeader("Set-Cookie", clearSessionCookie())
    return res.json({ ok: true })
  }

  return res.status(404).json({ error: "Unknown action" })
}
