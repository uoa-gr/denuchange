import { supabaseAdmin } from "../_lib/supabase-admin"
import { extractJwt } from "../_lib/auth"

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp"] as const
type AllowedExt = (typeof ALLOWED_EXTS)[number]
const EXT_MIME: Record<AllowedExt, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

// POST /api/app/avatar-upload-url
// { ext: "jpg"|"png"|"webp" } → { token, path, avatarPublicUrl }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const payload = extractJwt(req)
  if (!payload) return res.status(401).json({ error: "Unauthorized" })

  const ext: string = (req.body?.ext ?? "").toString().toLowerCase().replace(/^\./, "")
  if (!ALLOWED_EXTS.includes(ext as AllowedExt)) {
    return res.status(400).json({ error: "Unsupported file type" })
  }

  const safeName = payload.email.replace(/[^a-z0-9._-]/gi, "_")
  const path = `${safeName}/avatar.${ext}`

  const { data, error } = await supabaseAdmin.storage
    .from("avatars")
    .createSignedUploadUrl(path, { upsert: true })

  if (error || !data) {
    console.error("createSignedUploadUrl:", error)
    return res.status(500).json({ error: "Could not create upload URL" })
  }

  // Pre-save the path (will be valid once upload completes)
  await supabaseAdmin
    .from("app_users")
    .update({ avatar_path: path })
    .eq("email", payload.email)

  const supabaseUrl = process.env.VITE_SUPABASE_URL!
  const avatarPublicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${path}`

  return res.json({
    token: data.token,
    path,
    mimeType: EXT_MIME[ext as AllowedExt],
    avatarPublicUrl,
  })
}
