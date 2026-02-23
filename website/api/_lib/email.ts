import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com"
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "465", 10)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const FROM = process.env.SMTP_FROM ?? `DENUCHANGE Workshop <${SMTP_USER}>`

export function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

export function esc(str: string | undefined | null): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const BANNER = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#074F6A;">
    <tr>
      <td style="padding:20px 24px;font-family:Arial,Helvetica,sans-serif;">
        <h1 style="margin:0;color:#ffffff;font-size:18px;font-family:Arial,Helvetica,sans-serif;font-weight:600;">
          IAG DENUCHANGE Workshop 2026
        </h1>
        <p style="margin:4px 0 0;color:#b2dce5;font-size:13px;font-family:Arial,Helvetica,sans-serif;">
          6&#8211;9 October 2026 &middot; Naxos, Greece
        </p>
      </td>
    </tr>
  </table>
`

const FOOTER = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
    <tr>
      <td style="padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
        IAG DENUCHANGE Working Group &middot; National &amp; Kapodistrian University of Athens
      </td>
    </tr>
  </table>
`

export function wrapEmail(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
        <tr>
          <td align="center" style="padding:24px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;">
              <tr><td>${BANNER}</td></tr>
              <tr>
                <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;">
                  ${content}
                  ${FOOTER}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!SMTP_USER || !SMTP_PASS) return // graceful skip when SMTP not configured
  const transporter = createTransporter()
  await transporter.sendMail({ from: FROM, to, subject, html })
}
