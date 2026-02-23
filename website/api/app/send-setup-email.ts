import crypto from "crypto"
import { supabaseAdmin } from "../_lib/supabase-admin"
import { esc, sendMail, wrapEmail } from "../_lib/email"

const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://denuchange.vercel.app"

// POST /api/app/send-setup-email
// { email } → { sent: true } | 429 { error, retryAfter }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const email: string = (req.body?.email ?? "").toString().trim().toLowerCase()
  if (!email || email.length > 254) return res.status(400).json({ error: "Invalid email" })

  // Confirm user exists in app_users (must have gone through check-email first)
  const { data: user } = await supabaseAdmin
    .from("app_users")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (!user) return res.status(404).json({ error: "User not found" })

  // Rate-limit: no new token if one was created in the last 30 seconds
  const { data: recent } = await supabaseAdmin
    .from("password_setup_tokens")
    .select("created_at")
    .eq("email", email)
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recent) {
    const ageMs = Date.now() - new Date(recent.created_at).getTime()
    const RATE_LIMIT_MS = 30_000
    if (ageMs < RATE_LIMIT_MS) {
      const retryAfter = Math.ceil((RATE_LIMIT_MS - ageMs) / 1000)
      return res.status(429).json({ error: "Too many requests", retryAfter })
    }
  }

  // Generate 64-char hex token
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error: insertErr } = await supabaseAdmin
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
        <tr>
          <td align="center">
            <a href="${esc(setupLink)}"
              style="display:inline-block;background:#074F6A;color:#ffffff;font-weight:600;
                     font-size:15px;padding:13px 28px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
              Create Password
            </a>
          </td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:13px;line-height:1.5;">
        If you did not request this, you can ignore this email.
        The link will expire in 24 hours.
      </p>
      <p style="color:#6b7280;font-size:12px;word-break:break-all;">
        Or copy this URL: ${esc(setupLink)}
      </p>
    `)
  )

  return res.json({ sent: true })
}
