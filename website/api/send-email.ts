import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com"
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "465", 10)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const FROM = process.env.SMTP_FROM ?? `DENUCHANGE Workshop <${SMTP_USER}>`
const ORGANIZER = "evelpidou@geol.uoa.gr"

/** Escape HTML special characters to prevent injection in email templates */
function esc(str: string | undefined | null): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

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

const SUPPORT_MAILTO = `mailto:denuchange.workshop.2026@gmail.com?subject=${encodeURIComponent("DENUCHANGE Workshop – Change Request / Issue")}&body=${encodeURIComponent(`Type of request: [ Registration Change / Abstract Change / Payment Issue / Other ]

Email used for registration: 

Description of change or issue:


Additional comments:

`)}`

const FOOTER = `
  <div style="margin-top:24px;padding:14px 16px;background:#f9fafb;border-radius:6px;font-size:13px;font-family:sans-serif;color:#374151;line-height:1.6;">
    If you notice any issues or wish to make changes to your registration, abstract, or payment,
    please <a href="${SUPPORT_MAILTO}" style="color:#0a6e84;font-weight:600;">send us an email</a>.
  </div>
  <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;font-family:sans-serif;">
    IAG DENUCHANGE Working Group &middot; National &amp; Kapodistrian University of Athens
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

const dietaryLabel: Record<string, string> = {
  none: "None",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  kosher: "Kosher",
  gluten_free: "Gluten-free",
  other: "Other",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!SMTP_USER || !SMTP_PASS) {
    // Graceful skip when SMTP is not configured
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
        <h2 style="margin:0 0 8px;font-size:16px;color:#111827;">Hi ${esc(data.first_name)},</h2>
        <p style="color:#374151;line-height:1.6;">
          Thank you for registering for the <strong>5th IAG DENUCHANGE Workshop</strong>.
          Your registration has been recorded.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;width:40%;">Name</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.first_name)} ${esc(data.last_name)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Email</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.email)}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Affiliation</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.affiliation)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Country</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.country)}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Registration</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${registrationTypeLabel[data.registration_type] ?? esc(data.registration_type)}</td>
          </tr>
          ${data.abstract_intent !== "none" ? `
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Abstract intent</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.abstract_intent === "oral" ? "Oral presentation" : "Poster presentation"}</td>
          </tr>` : ""}
          <tr${data.abstract_intent !== "none" ? " style=\"background:#f9fafb;\"" : ""}>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Dietary</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${data.dietary === "other" ? esc(data.dietary_other) : (dietaryLabel[data.dietary] ?? "None")}</td>
          </tr>
          ${data.special_requirements ? `
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Special requirements</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.special_requirements)}</td>
          </tr>` : ""}
        </table>
        <p style="color:#374151;line-height:1.6;">
          <strong>Next step:</strong> Please complete your bank transfer and upload your payment
          receipt (Αποδεικτικό Πληρωμής) on the workshop website. Bank transfer details will be
          announced on the website.
        </p>
      `)
    } else if (type === "abstract") {
      subject = "Abstract Received – IAG DENUCHANGE Workshop 2026"
      html = wrap(`
        <h2 style="margin:0 0 8px;font-size:16px;color:#111827;">Hi ${esc(data.first_name)},</h2>
        <p style="color:#374151;line-height:1.6;">
          We have received your abstract submission for the <strong>5th IAG DENUCHANGE Workshop</strong>.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;width:40%;">Name</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.first_name)} ${esc(data.last_name)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Email</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.email)}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Affiliation</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.affiliation)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Title</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.title)}</td>
          </tr>
          ${data.co_authors ? `
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Co-authors</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.co_authors)}</td>
          </tr>` : ""}
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
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <tr style="background:#f9fafb;">
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;width:40%;">Email</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.email)}</td>
          </tr>
          ${data.notes ? `
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Notes</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(data.notes)}</td>
          </tr>` : ""}
        </table>
        <p style="color:#374151;line-height:1.6;">
          If you have any questions, please contact us at
          <a href="mailto:evelpidou@geol.uoa.gr" style="color:#0a6e84;">evelpidou@geol.uoa.gr</a>.
        </p>
      `)
    } else if (type === "verify") {
      subject = "Email Verification – IAG DENUCHANGE Workshop 2026"
      html = wrap(`
        <h2 style="margin:0 0 8px;font-size:16px;color:#111827;">Email Verification</h2>
        <p style="color:#374151;line-height:1.6;">
          This email was sent to verify that <strong>${esc(email)}</strong> is the correct address
          you entered for the <strong>5th IAG DENUCHANGE Workshop</strong> registration.
        </p>
        <p style="color:#374151;line-height:1.6;">
          If you received this message, your email address is correct. You can go back to the
          registration form and complete your submission.
        </p>
        <p style="color:#9ca3af;font-size:13px;line-height:1.6;">
          If you did not request this verification, you can safely ignore this email.
        </p>
      `)
    } else {
      return res.status(400).json({ error: "Unknown email type" })
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    await transporter.sendMail({
      from: FROM,
      to: email,
      bcc: ORGANIZER,
      subject,
      html,
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error("Email error:", err)
    res.status(500).json({ error: "Failed to send email" })
  }
}
