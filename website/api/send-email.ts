import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? "DENUCHANGE Workshop <noreply@resend.dev>"
const ORGANIZER = "evelpidou@geol.uoa.gr"

const BANNER = `
  <div style="background:#0a6e84;padding:20px 24px;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;color:#ffffff;font-size:18px;font-family:sans-serif;font-weight:600;">
      IAG DENUCHANGE Workshop 2026
    </h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-family:sans-serif;">
      6–9 October 2026 · Naxos, Greece
    </p>
  </div>
`

const FOOTER = `
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;font-family:sans-serif;">
    IAG DENUCHANGE Working Group · National &amp; Kapodistrian University of Athens<br>
    Contact: <a href="mailto:evelpidou@geol.uoa.gr" style="color:#0a6e84;">evelpidou@geol.uoa.gr</a>
  </div>
`

function wrap(content: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${BANNER}
      <div style="padding:24px;">
        ${content}
        ${FOOTER}
      </div>
    </div>
  `
}

const registrationTypeLabel: Record<string, string> = {
  regular_full: "Regular – Workshop + Field Trip (€450)",
  student_full: "Student – Workshop + Field Trip (€300)",
  meeting_only: "Meeting Only – Regular or Student (€100)",
  accompanying: "Accompanying Person – Field Trip Only (€300)",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!process.env.RESEND_API_KEY) {
    // Graceful skip when not configured
    return res.status(200).json({ skipped: true })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = req.body
  const { type, email } = data

  if (!email || !type) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    let subject: string
    let html: string

    if (type === "registration") {
      subject = "Registration Confirmed – IAG DENUCHANGE Workshop 2026"
      html = wrap(`
        <h2 style="margin:0 0 8px;font-size:16px;color:#111827;">Hi ${data.first_name},</h2>
        <p style="color:#374151;line-height:1.6;">
          Thank you for registering for the <strong>5th IAG DENUCHANGE Workshop</strong>.
          Your registration has been recorded.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;width:40%;">Name</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.first_name} ${data.last_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Affiliation</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.affiliation}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Registration</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${registrationTypeLabel[data.registration_type] ?? data.registration_type}</td>
          </tr>
          ${data.abstract_intent !== "none" ? `
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Abstract intent</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.abstract_intent === "oral" ? "Oral presentation" : "Poster presentation"}</td>
          </tr>` : ""}
        </table>
        <p style="color:#374151;line-height:1.6;">
          <strong>Next step:</strong> Please complete your bank transfer and upload your payment
          receipt (Αποδεικτικό Πληρωμής) on the workshop website. Bank transfer details will be
          communicated separately.
        </p>
      `)
    } else if (type === "abstract") {
      subject = "Abstract Received – IAG DENUCHANGE Workshop 2026"
      html = wrap(`
        <h2 style="margin:0 0 8px;font-size:16px;color:#111827;">Hi ${data.first_name},</h2>
        <p style="color:#374151;line-height:1.6;">
          We have received your abstract submission for the <strong>5th IAG DENUCHANGE Workshop</strong>.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;width:40%;">Title</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.title}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Presentation</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.presentation_type === "oral" ? "Oral presentation" : "Poster presentation"}</td>
          </tr>
        </table>
        <p style="color:#374151;line-height:1.6;">
          Author notifications will be sent by <strong>June 15, 2026</strong>.
        </p>
      `)
    } else if (type === "payment") {
      subject = "Payment Receipt Received – IAG DENUCHANGE Workshop 2026"
      html = wrap(`
        <p style="color:#374151;line-height:1.6;">
          We have received your payment receipt (Αποδεικτικό Πληρωμής).
          Your registration will be confirmed within a few business days.
        </p>
        <p style="color:#374151;line-height:1.6;">
          If you have any questions, please contact us at
          <a href="mailto:evelpidou@geol.uoa.gr" style="color:#0a6e84;">evelpidou@geol.uoa.gr</a>.
        </p>
      `)
    } else {
      return res.status(400).json({ error: "Unknown email type" })
    }

    await resend.emails.send({
      from: FROM,
      to: [email],
      bcc: [ORGANIZER],
      subject,
      html,
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error("Email error:", err)
    res.status(500).json({ error: "Failed to send email" })
  }
}
