import { clearSessionCookie } from "../_lib/auth"

// POST /api/app/logout → clears session cookie
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  res.setHeader("Set-Cookie", clearSessionCookie())
  return res.json({ ok: true })
}
