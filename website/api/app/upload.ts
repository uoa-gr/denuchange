import { getSupabaseAdmin } from "../_lib/supabase-admin"
import { extractJwt } from "../_lib/auth"

// Consolidated upload-URL handler
// POST ?action=avatar   → signed upload URL for user avatar (authenticated)
// POST ?action=gallery  → signed upload URL for gallery photo (admin only)

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp"] as const
type AllowedExt = (typeof ALLOWED_EXTS)[number]
const EXT_MIME: Record<AllowedExt, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  try {
    return await _handle(req, res)
  } catch (err) {
    console.error("[upload]", err)
    if (!res.headersSent) res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _handle(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const action: string = (req.query?.action ?? "").toString()
  const payload = extractJwt(req)
  if (!payload) return res.status(401).json({ error: "Unauthorized" })

  const ext: string = (req.body?.ext ?? "").toString().toLowerCase().replace(/^\./, "")
  if (!ALLOWED_EXTS.includes(ext as AllowedExt)) {
    return res.status(400).json({ error: "Unsupported file type" })
  }
  const mimeType = EXT_MIME[ext as AllowedExt]

  if (action === "avatar") {
    const safeName = payload.email.replace(/[^a-z0-9._-]/gi, "_")
    const path = `${safeName}/avatar.${ext}`

    const { data, error } = await getSupabaseAdmin().storage
      .from("avatars")
      .createSignedUploadUrl(path, { upsert: true })
    if (error || !data) {
      console.error("avatar createSignedUploadUrl:", error)
      return res.status(500).json({ error: "Could not create upload URL" })
    }

    await getSupabaseAdmin().from("app_users").update({ avatar_path: path }).eq("email", payload.email)

    const supabaseUrl = process.env.VITE_SUPABASE_URL as string
    return res.json({
      token: data.token,
      path,
      mimeType,
      avatarPublicUrl: `${supabaseUrl}/storage/v1/object/public/avatars/${path}`,
    })
  }

  if (action === "gallery") {
    if (!payload.isAdmin) return res.status(403).json({ error: "Forbidden" })

    const caption: string = (req.body?.caption ?? "").toString().trim().slice(0, 500)
    const timestamp = Date.now()
    const randomHex = Math.random().toString(16).slice(2, 10)
    const filePath = `${timestamp}-${randomHex}.${ext}`

    const { data, error } = await getSupabaseAdmin().storage
      .from("gallery")
      .createSignedUploadUrl(filePath)
    if (error || !data) {
      console.error("gallery createSignedUploadUrl:", error)
      return res.status(500).json({ error: "Could not create upload URL" })
    }

    const { data: inserted, error: insertErr } = await getSupabaseAdmin()
      .from("gallery_images")
      .insert({ file_path: filePath, caption, uploaded_by: payload.email })
      .select("id")
      .single()
    if (insertErr || !inserted) {
      console.error("gallery insert:", insertErr)
      return res.status(500).json({ error: "Internal server error" })
    }

    return res.json({ token: data.token, path: filePath, imageId: inserted.id, mimeType })
  }

  return res.status(404).json({ error: "Unknown action" })
}
