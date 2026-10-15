import { randomUUID } from "node:crypto"
import { extractJwt } from "../_lib/auth"
import { getSupabaseAdmin } from "../_lib/supabase-admin"
import type { GalleryPlacement, ManagedGalleryItem } from "../../src/app/lib/gallery-admin-api"

const MAX_BYTES = 100 * 1024 * 1024
const PAGE_SIZE = 500
const DAYS = ["day-0", "day-1", "day-2", "day-3", "day-4", "overview"]
const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", mp4: "video/mp4",
}
const COLUMNS = "id,file_path,caption,created_at,day_id,group_id,group_title,group_order,media_kind,sort_order,original_filename,file_size,preview_path,width,height,is_published,upload_complete"

interface GalleryRow {
  id: string
  file_path: string
  caption: string | null
  created_at: string
  day_id: string | null
  group_id: string | null
  group_title: string | null
  group_order: number
  media_kind: "photo" | "collage" | "video"
  sort_order: number
  original_filename: string | null
  file_size: number | null
  preview_path: string | null
  width: number
  height: number
  is_published: boolean
  upload_complete: boolean
}

class GalleryError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function extension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1).toLowerCase()
}

function validatePlacement(value: unknown): GalleryPlacement {
  const placement = value as Partial<GalleryPlacement> | null
  if (!placement || !DAYS.includes(placement.dayId || "")) throw new GalleryError(400, "Choose a workshop day.")
  if (typeof placement.groupId !== "string" || !/^[a-z0-9][a-z0-9_-]{0,99}$/.test(placement.groupId)) {
    throw new GalleryError(400, "Choose an activity group with a valid name.")
  }
  const groupTitle = typeof placement.groupTitle === "string" ? placement.groupTitle.trim() : ""
  if (!groupTitle || groupTitle.length > 150 || /[\u0000-\u001f\u007f]/.test(groupTitle)) {
    throw new GalleryError(400, "Activity names must be between 1 and 150 characters.")
  }
  if (!["photo", "collage", "video"].includes(placement.kind || "")) throw new GalleryError(400, "Choose Images, Collages or Videos.")
  if (typeof placement.position !== "number" || !Number.isFinite(placement.position) || placement.position < 0 || placement.position > 1000000000) {
    throw new GalleryError(400, "Enter a valid position in the activity.")
  }
  if (typeof placement.groupOrder !== "number" || !Number.isInteger(placement.groupOrder) || placement.groupOrder < 0 || placement.groupOrder > 1000000) {
    throw new GalleryError(400, "Enter a valid activity order.")
  }
  if (placement.title !== undefined && (typeof placement.title !== "string" || placement.title.length > 500 || /[\u0000-\u001f\u007f]/.test(placement.title))) {
    throw new GalleryError(400, "Titles must be shorter than 500 characters.")
  }
  return { ...placement, groupTitle, title: placement.title?.trim() } as GalleryPlacement
}

function placementColumns(placement: GalleryPlacement) {
  return {
    day_id: placement.dayId, group_id: placement.groupId, group_title: placement.groupTitle,
    group_order: placement.groupOrder, media_kind: placement.kind, sort_order: placement.position,
    ...(placement.title !== undefined ? { caption: placement.title } : {}),
  }
}

function validateId(value: unknown): string {
  const id = typeof value === "string" ? value : ""
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new GalleryError(400, "Choose a gallery item.")
  return id
}

function assertFileKind(filename: string, kind: GalleryPlacement["kind"]): string {
  const ext = extension(filename)
  if (!(ext in MIME_TYPES) || (kind === "video") !== (ext === "mp4")) {
    throw new GalleryError(400, kind === "video" ? "Videos must be MP4 files." : "Images and collages must be JPG, PNG or WebP files.")
  }
  return ext
}

function assetUrl(path: string): string {
  const base = process.env.VITE_SUPABASE_URL!
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/gallery/${path.split("/").map(encodeURIComponent).join("/")}`
}

function toItem(row: GalleryRow): ManagedGalleryItem {
  const filename = row.original_filename || row.file_path.split("/").pop() || "workshop-photo.jpg"
  const original = assetUrl(row.file_path)
  const preview = row.preview_path ? assetUrl(row.preview_path) : ""
  return {
    id: String(row.id), kind: row.media_kind, title: row.caption || row.group_title || filename,
    filename, original, src: row.media_kind === "video" ? original : preview || original,
    thumbnail: preview || (row.media_kind === "video" ? "" : original),
    ...(row.media_kind === "video" && preview ? { poster: preview } : {}),
    bytes: Number(row.file_size) || 0, width: row.width || 0, height: row.height || 0,
    dayId: row.day_id, groupId: row.group_id, groupTitle: row.group_title,
    groupOrder: row.group_order, position: row.sort_order,
    published: row.is_published, uploadComplete: row.upload_complete,
  }
}

async function getRow(id: string): Promise<GalleryRow> {
  const { data, error } = await getSupabaseAdmin().from("gallery_images").select(COLUMNS).eq("id", id).maybeSingle()
  if (error) throw new GalleryError(500, "The gallery item could not be loaded.")
  if (!data) throw new GalleryError(404, "This gallery item no longer exists.")
  return data as GalleryRow
}

async function listItems(published: boolean): Promise<ManagedGalleryItem[]> {
  const rows: GalleryRow[] = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    let query = getSupabaseAdmin().from("gallery_images").select(COLUMNS)
    if (published) query = query.eq("is_published", true).eq("upload_complete", true).not("day_id", "is", null).not("group_id", "is", null).not("group_title", "is", null)
    const { data, error } = await query.order("created_at", { ascending: true }).order("id", { ascending: true }).range(offset, offset + PAGE_SIZE - 1)
    if (error) throw new GalleryError(500, "The gallery could not be loaded. Its storage setup may need updating.")
    rows.push(...(data || []) as GalleryRow[])
    if (!data || data.length < PAGE_SIZE) break
  }
  return rows.filter((row) => !published || DAYS.includes(row.day_id || "") && !!row.group_id && !!row.group_title)
    .sort((a, b) => (DAYS.indexOf(a.day_id || "") - DAYS.indexOf(b.day_id || "")) || a.group_order - b.group_order || a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at) || String(a.id).localeCompare(String(b.id)))
    .map(toItem)
}

async function storageObject(path: string) {
  const slash = path.lastIndexOf("/")
  const folder = slash < 0 ? "" : path.slice(0, slash)
  const name = path.slice(slash + 1)
  const { data, error } = await getSupabaseAdmin().storage.from("gallery").list(folder, { search: name, limit: 100 })
  if (error) throw new GalleryError(500, "The uploaded file could not be found in storage. Please try again.")
  return data?.find((object) => object.name === name && object.id) || null
}

async function requireOriginal(row: GalleryRow) {
  const file = await storageObject(row.file_path)
  if (!file) throw new GalleryError(400, "The file has not finished uploading. Please upload it again.")
  const size = Number(file.metadata?.size)
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) throw new GalleryError(400, "The uploaded file is empty or exceeds 100 MB.")
  const mimeType = MIME_TYPES[assertFileKind(row.original_filename || row.file_path, row.media_kind)]
  if (file.metadata?.mimetype !== mimeType) throw new GalleryError(400, "The uploaded file format does not match its gallery type.")
  if (row.file_size !== null && Number(row.file_size) !== size) throw new GalleryError(400, "The upload is incomplete. Please upload this file again.")
  return size
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Cache-Control", "private, no-store")
    const action = typeof req.query?.action === "string" ? req.query.action : ""
    if (action === "published") {
      if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })
      return res.json(await listItems(true))
    }
    const payload = extractJwt(req)
    if (!payload) return res.status(401).json({ error: "Sign in to manage the gallery." })
    if (!payload.isAdmin) return res.status(403).json({ error: "Gallery management is available to administrators only." })

    if (action === "manage") {
      if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })
      return res.json(await listItems(false))
    }
    if (action === "prepare") {
      if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
      const placement = validatePlacement(req.body?.placement)
      const file = req.body?.file
      if (typeof file?.name !== "string" || !file.name || file.name.length > 255 || /[\\/\u0000-\u001f\u007f]/.test(file.name)) throw new GalleryError(400, "Choose a file with a valid filename.")
      if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_BYTES) throw new GalleryError(400, "Choose a file smaller than 100 MB.")
      const ext = assertFileKind(file.name, placement.kind)
      const directory = `managed/${randomUUID()}`
      const path = `${directory}/original.${ext}`
      const previewPath = placement.kind === "video" ? null : `${directory}/preview.webp`
      const sb = getSupabaseAdmin()
      const { data: originalUpload, error: originalError } = await sb.storage.from("gallery").createSignedUploadUrl(path)
      if (originalError || !originalUpload) throw new GalleryError(500, "An upload URL could not be created. Please try again.")
      let previewUpload: { path: string; token: string; mimeType: string } | undefined
      if (previewPath) {
        const { data, error } = await sb.storage.from("gallery").createSignedUploadUrl(previewPath)
        if (error || !data) throw new GalleryError(500, "An image preview upload URL could not be created.")
        previewUpload = { path: previewPath, token: data.token, mimeType: "image/webp" }
      }
      const { data, error } = await sb.from("gallery_images").insert({
        ...placementColumns(placement), file_path: path, preview_path: previewPath,
        original_filename: file.name, file_size: file.size, uploaded_by: payload.email,
        caption: placement.title || "", is_published: false, upload_complete: false,
      }).select("id").single()
      if (error || !data) throw new GalleryError(500, "The upload draft could not be created. Its storage setup may need updating.")
      return res.json({ id: String(data.id), path, token: originalUpload.token, mimeType: MIME_TYPES[ext], ...(previewUpload ? { previewUpload } : {}) })
    }
    if (action === "complete") {
      if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
      const id = validateId(req.body?.id)
      const row = await getRow(id)
      const width = req.body?.width
      const height = req.body?.height
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 0 || height < 0 || width > 100000 || height > 100000) throw new GalleryError(400, "The image dimensions could not be read.")
      const size = await requireOriginal(row)
      let previewPath = row.preview_path
      if (previewPath) {
        const preview = await storageObject(previewPath)
        if (!preview) previewPath = null
        else if (preview.metadata?.mimetype !== "image/webp" || Number(preview.metadata?.size) > MAX_BYTES) throw new GalleryError(400, "The image preview could not be processed.")
      }
      const { data, error } = await getSupabaseAdmin().from("gallery_images").update({
        upload_complete: true, file_size: size, width, height, preview_path: previewPath,
      }).eq("id", id).select(COLUMNS).single()
      if (error || !data) throw new GalleryError(500, "The upload could not be completed. Please try again.")
      return res.json(toItem(data as GalleryRow))
    }
    if (action === "update") {
      if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" })
      const id = validateId(req.body?.id)
      const placement = validatePlacement(req.body)
      const row = await getRow(id)
      assertFileKind(row.original_filename || row.file_path, placement.kind)
      const published = req.body?.published
      if (published !== undefined && typeof published !== "boolean") throw new GalleryError(400, "Choose whether this item is published.")
      if (published === true || published === undefined && row.is_published) {
        if (!row.upload_complete) throw new GalleryError(400, "Finish uploading this file before publishing it.")
        await requireOriginal({ ...row, media_kind: placement.kind })
      }
      const { data, error } = await getSupabaseAdmin().from("gallery_images").update({
        ...placementColumns(placement), ...(published !== undefined ? { is_published: published } : {}),
      }).eq("id", id).select(COLUMNS).single()
      if (error || !data) throw new GalleryError(500, "The gallery item could not be saved. Please try again.")
      return res.json(toItem(data as GalleryRow))
    }
    if (action === "remove") {
      if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" })
      const id = validateId(req.body?.id)
      const row = await getRow(id)
      const sb = getSupabaseAdmin()
      if (row.is_published) {
        const { error } = await sb.from("gallery_images").update({ is_published: false }).eq("id", id)
        if (error) throw new GalleryError(500, "The item could not be removed from the gallery.")
      }
      const { error: fileError } = await sb.storage.from("gallery").remove([row.file_path, ...(row.preview_path ? [row.preview_path] : [])])
      if (fileError) throw new GalleryError(500, "The file could not be removed. It has been kept as a draft; please try again.")
      const { error } = await sb.from("gallery_images").delete().eq("id", id)
      if (error) throw new GalleryError(500, "The gallery record could not be removed. Please try again.")
      return res.json({ ok: true })
    }
    return res.status(404).json({ error: "Unknown gallery action" })
  } catch (error) {
    if (!(error instanceof GalleryError)) console.error("[gallery]", error)
    if (!res.headersSent) return res.status(error instanceof GalleryError ? error.status : 500).json({ error: error instanceof GalleryError ? error.message : "The gallery is temporarily unavailable. Please try again." })
  }
}
