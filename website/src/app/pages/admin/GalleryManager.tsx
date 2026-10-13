import { useEffect, useRef, useState, type FormEvent } from "react"
import { Eye, EyeOff, Pencil, Trash2, Video, X } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { galleryAdminApi, type GalleryPlacement, type ManagedGalleryItem } from "@/app/lib/gallery-admin-api"
import { localGalleryStore } from "@/app/lib/gallery-local-preview"
import { workshopGalleryDays, workshopGalleryOverview, type GalleryMedia } from "@/app/lib/workshop-gallery-data"
import { supabase } from "@/lib/supabase"

const mediaTypes = [{ kind: "photo", label: "Images" }, { kind: "collage", label: "Collages" }, { kind: "video", label: "Videos" }] as const
const controlClass = "w-full min-w-0 min-h-11 rounded-lg bg-muted px-3 py-2 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
const actionClass = "inline-flex h-11 w-11 flex-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-40"
const firstDay = workshopGalleryDays[0]
const staticItems = [
  ...workshopGalleryDays.flatMap((day) => day.groups.flatMap((group, groupOrder) => group.items.map((item, index) => ({
    ...item, dayId: day.id, groupId: group.id, groupTitle: group.title, groupOrder, position: index + 1,
  })))),
  ...workshopGalleryOverview.map((item, index) => ({ ...item, dayId: "overview", groupId: "film", groupTitle: "Workshop video", groupOrder: 0, position: index + 1 })),
]

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : "Could not save this change. Please try again."
}

function previewSource(source: string) {
  return /^(https?:|blob:|data:)/.test(source) ? source : `${import.meta.env.BASE_URL}${source.replace(/^\//, "")}`
}

async function imagePreview(file: File) {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Could not prepare the image preview.")
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error("Could not prepare the image preview."))
    }, "image/webp", 0.85))
    return { blob, width: bitmap.width, height: bitmap.height }
  } finally {
    bitmap.close()
  }
}

async function uploadOriginal(file: File, placement: GalleryPlacement): Promise<ManagedGalleryItem> {
  const image = placement.kind === "video" ? null : await imagePreview(file)
  const prepared = await galleryAdminApi.prepare({ name: file.name, size: file.size }, placement)
  try {
    const original = await supabase.storage.from("gallery").uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: prepared.mimeType, upsert: false })
    if (original.error) throw original.error
    if (image) {
      if (!prepared.previewUpload) throw new Error("Could not prepare the image upload.")
      const preview = await supabase.storage.from("gallery").uploadToSignedUrl(prepared.previewUpload.path, prepared.previewUpload.token, image.blob, { contentType: prepared.previewUpload.mimeType, upsert: false })
      if (preview.error) throw preview.error
    }
    return await galleryAdminApi.complete(prepared.id, image?.width ?? 0, image?.height ?? 0)
  } catch (error) {
    try { await galleryAdminApi.remove(prepared.id) } catch { /* The unfinished draft remains available to remove. */ }
    throw error
  }
}

export function GalleryManager({ preview = false }: { preview?: boolean }) {
  const { user } = useAuth()
  const localPreview = import.meta.env.DEV && preview
  const allowed = localPreview || !!user?.isAdmin
  const fileInput = useRef<HTMLInputElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const [items, setItems] = useState<ManagedGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [kind, setKind] = useState<GalleryMedia["kind"]>("photo")
  const [dayId, setDayId] = useState(firstDay.id)
  const [groupId, setGroupId] = useState(firstDay.groups[0].id)
  const [newGroupTitle, setNewGroupTitle] = useState("")
  const [placeAfter, setPlaceAfter] = useState("end")
  const [title, setTitle] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [editing, setEditing] = useState<ManagedGalleryItem | null>(null)

  useEffect(() => {
    if (!allowed) return
    let active = true
    setLoading(true)
    const store = localPreview ? localGalleryStore : galleryAdminApi
    store.list().then((rows) => { if (active) setItems(rows) }).catch((reason) => { if (active) setError(messageFor(reason)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [allowed, localPreview])

  const day = workshopGalleryDays.find((entry) => entry.id === dayId)
  const groups = dayId === "overview"
    ? [{ id: "film", title: "Workshop video", order: 0 }]
    : (day?.groups.map((group, order) => ({ id: group.id, title: group.title, order })) ?? [])
  for (const item of items) {
    if (item.dayId === dayId && item.groupId && item.groupTitle && !groups.some((group) => group.id === item.groupId)) {
      groups.push({ id: item.groupId, title: item.groupTitle, order: item.groupOrder })
    }
  }
  groups.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
  const namedGroup = groupId === "new" ? groups.find((group) => group.title.toLocaleLowerCase() === newGroupTitle.trim().toLocaleLowerCase()) : undefined
  const selectedGroup = namedGroup ?? groups.find((group) => group.id === groupId)
  const peers = [...staticItems, ...items.filter((item) => item.uploadComplete)]
    .filter((item) => item.id !== editing?.id && item.kind === kind && item.dayId === dayId && item.groupId === selectedGroup?.id)
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
  const listedItems = [...items].sort((a, b) => {
    const dayOrder = (id: string | null) => id === "overview" ? workshopGalleryDays.length : workshopGalleryDays.findIndex((entry) => entry.id === id)
    return dayOrder(a.dayId) - dayOrder(b.dayId) || a.groupOrder - b.groupOrder || a.position - b.position || a.filename.localeCompare(b.filename, undefined, { numeric: true })
  })

  function clearFiles() {
    setFiles([])
    if (fileInput.current) fileInput.current.value = ""
  }

  function changeDay(nextDay: string) {
    setDayId(nextDay)
    const firstGroup = nextDay === "overview" ? "film" : workshopGalleryDays.find((entry) => entry.id === nextDay)?.groups[0]?.id ?? "new"
    setGroupId(firstGroup)
    setNewGroupTitle("")
    setPlaceAfter("end")
  }

  function placementAt(position: number): GalleryPlacement {
    const groupTitle = selectedGroup?.title ?? newGroupTitle.trim()
    if (!groupTitle) throw new Error("Enter a group name.")
    let hash = 0
    for (const character of groupTitle.toLocaleLowerCase()) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0
    const slug = groupTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50)
    return {
      kind, dayId, groupId: selectedGroup?.id ?? `new-${slug || "group"}-${(hash >>> 0).toString(36)}`,
      groupTitle, groupOrder: selectedGroup?.order ?? Math.max(-1, ...groups.map((group) => group.order)) + 1,
      position, title: title.trim() || undefined,
    }
  }

  function positionsFor(count: number) {
    let index = placeAfter === "start" ? -1 : peers.findIndex((item) => item.id === placeAfter)
    if (placeAfter === "end" || placeAfter !== "start" && index < 0) index = peers.length - 1
    const previous = peers[index]?.position ?? 0
    const next = peers[index + 1]?.position
    return Array.from({ length: count }, (_, offset) => next === undefined ? previous + offset + 1 : previous + (next - previous) * (offset + 1) / (count + 1))
  }

  function replaceItem(item: ManagedGalleryItem) {
    setItems((rows) => rows.some((row) => row.id === item.id) ? rows.map((row) => row.id === item.id ? item : row) : [...rows, item])
    window.dispatchEvent(new Event("denuchange-gallery-change"))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!allowed || busy || !editing && files.length === 0) return
    setError("")
    setStatus("")
    setBusy(true)
    let completed = 0
    try {
      const positions = positionsFor(editing ? 1 : files.length)
      if (editing) {
        const placement = placementAt(positions[0])
        const updated = localPreview ? await localGalleryStore.update(editing.id, placement) : await galleryAdminApi.update(editing.id, placement)
        replaceItem(updated)
        setEditing(null)
        setTitle("")
        setPlaceAfter("end")
        setStatus("Changes saved.")
      } else {
        const placement = placementAt(positions[0])
        for (const [index, file] of files.entries()) {
          setStatus(`Uploading ${index + 1} of ${files.length}…`)
          const positioned = { ...placement, position: positions[index], title: files.length === 1 ? placement.title : undefined }
          const added = localPreview ? await localGalleryStore.upload(file, positioned) : await uploadOriginal(file, positioned)
          replaceItem(added)
          completed += 1
        }
        clearFiles()
        setTitle("")
        setPlaceAfter("end")
        setStatus(`${completed === 1 ? "File added as a draft" : `${completed} files added as drafts`}. Publish when ready.`)
      }
    } catch (reason) {
      setStatus("")
      setError(`${completed > 0 ? `${completed} files added as drafts. ` : ""}${messageFor(reason)}`)
      if (completed > 0) setFiles((selected) => selected.slice(completed))
      if (!localPreview) galleryAdminApi.list().then(setItems).catch(() => {})
    } finally {
      setBusy(false)
    }
  }

  function editItem(item: ManagedGalleryItem) {
    setEditing(item)
    clearFiles()
    setKind(item.kind)
    const destination = item.dayId && (item.dayId === "overview" || workshopGalleryDays.some((entry) => entry.id === item.dayId)) ? item.dayId : firstDay.id
    setDayId(destination)
    setGroupId(item.groupId && item.dayId === destination ? item.groupId : destination === "overview" ? "film" : firstDay.groups[0].id)
    setNewGroupTitle("")
    setTitle(item.title)
    const previous = [...staticItems, ...items.filter((entry) => entry.uploadComplete)]
      .filter((entry) => entry.id !== item.id && entry.kind === item.kind && entry.dayId === item.dayId && entry.groupId === item.groupId && entry.position < item.position)
      .sort((a, b) => b.position - a.position)[0]
    setPlaceAfter(item.dayId && item.groupId ? previous?.id ?? "start" : "end")
    setError("")
    setStatus("")
    form.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function setPublished(item: ManagedGalleryItem, published: boolean) {
    if (!allowed || busy || !item.dayId || !item.groupId || !item.groupTitle) return
    setBusy(true)
    setError("")
    setStatus("")
    try {
      const placement: GalleryPlacement & { published: boolean } = { dayId: item.dayId, groupId: item.groupId, groupTitle: item.groupTitle, groupOrder: item.groupOrder, kind: item.kind, position: item.position, title: item.title, published }
      replaceItem(localPreview ? await localGalleryStore.update(item.id, placement) : await galleryAdminApi.update(item.id, placement))
      setStatus(published ? "Published in the gallery." : "Hidden from the gallery.")
    } catch (reason) { setError(messageFor(reason)) } finally { setBusy(false) }
  }

  async function removeItem(item: ManagedGalleryItem) {
    if (!allowed || busy || !window.confirm(`Remove ${item.filename}?`)) return
    setBusy(true)
    setError("")
    setStatus("")
    try {
      if (localPreview) await localGalleryStore.remove(item.id)
      else await galleryAdminApi.remove(item.id)
      setItems((rows) => rows.filter((row) => row.id !== item.id))
      if (editing?.id === item.id) { setEditing(null); setTitle("") }
      window.dispatchEvent(new Event("denuchange-gallery-change"))
      setStatus("File removed.")
    } catch (reason) { setError(messageFor(reason)) } finally { setBusy(false) }
  }

  if (!allowed) return null

  return (
    <div className="p-4 space-y-5">
      {localPreview && <p className="text-xs text-muted-foreground">Local preview · changes stay in this browser</p>}
      <form ref={form} onSubmit={(event) => void handleSubmit(event)} className="space-y-3 scroll-mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{editing ? "Edit file" : "Add to gallery"}</p>
          {editing && <button type="button" disabled={busy} onClick={() => { setEditing(null); setTitle(""); setPlaceAfter("end") }} className={actionClass} title="Cancel editing" aria-label="Cancel editing"><X className="h-4 w-4" /></button>}
        </div>
        <fieldset disabled={busy || loading} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="gallery-kind" className="mb-1 block text-xs font-medium">Type</label>
              <select id="gallery-kind" value={kind} onChange={(event) => { const next = event.target.value as GalleryMedia["kind"]; setKind(next); setPlaceAfter("end"); clearFiles(); if (next !== "video" && dayId === "overview") changeDay(firstDay.id) }} className={controlClass}>
                {mediaTypes.map((type) => <option key={type.kind} value={type.kind} disabled={!!editing && (editing.kind === "video") !== (type.kind === "video")}>{type.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="gallery-day" className="mb-1 block text-xs font-medium">Day</label>
              <select id="gallery-day" value={dayId} onChange={(event) => changeDay(event.target.value)} className={controlClass}>
                {workshopGalleryDays.map((entry) => <option key={entry.id} value={entry.id}>{entry.label} · {new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</option>)}
                {kind === "video" && <option value="overview">Workshop overview</option>}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="gallery-group" className="mb-1 block text-xs font-medium">Group</label>
            <select id="gallery-group" value={groupId} onChange={(event) => { setGroupId(event.target.value); setPlaceAfter("end") }} className={controlClass}>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
              {dayId !== "overview" && <option value="new">+ New group</option>}
            </select>
          </div>
          {groupId === "new" && <div>
            <label htmlFor="gallery-group-title" className="mb-1 block text-xs font-medium">Group name</label>
            <input id="gallery-group-title" value={newGroupTitle} onChange={(event) => { setNewGroupTitle(event.target.value); setPlaceAfter("end") }} maxLength={100} required placeholder="e.g. Bar" className={controlClass} />
          </div>}
          <div>
            <label htmlFor="gallery-position" className="mb-1 block text-xs font-medium">Place after</label>
            <select id="gallery-position" value={placeAfter} onChange={(event) => setPlaceAfter(event.target.value)} className={controlClass}>
              <option value="end">Last in this group</option>
              <option value="start">First in this group</option>
              {peers.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.title || item.filename}</option>)}
            </select>
          </div>
          {!editing && <div>
            <label htmlFor="gallery-files" className="mb-1 block text-xs font-medium">{kind === "video" ? "Videos" : "Files"}</label>
            <input id="gallery-files" ref={fileInput} type="file" multiple accept={kind === "video" ? "video/mp4,.mp4" : "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"} onChange={(event) => { setFiles(Array.from(event.target.files ?? []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))); setError(""); setStatus("") }} className="w-full min-h-11 text-base sm:text-sm text-muted-foreground file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:text-sm file:font-medium" />
            {files.length > 1 && <p className="mt-1 text-xs text-muted-foreground">{files.length} files · filename order</p>}
          </div>}
          {(editing || files.length === 1) && <div>
            <label htmlFor="gallery-title" className="mb-1 block text-xs font-medium">Title <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input id="gallery-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="Uses the filename if left blank" className={controlClass} />
          </div>}
        </fieldset>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        {status && <p role="status" className="text-xs text-muted-foreground">{status}</p>}
        <button type="submit" disabled={busy || loading || !editing && files.length === 0 || groupId === "new" && !newGroupTitle.trim()} className="min-h-11 w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {busy ? "Saving…" : editing ? "Save changes" : "Upload as drafts"}
        </button>
      </form>
      <div>
        <p className="mb-2 text-sm font-medium">Uploads</p>
        {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : items.length === 0 ? <p className="text-xs text-muted-foreground">No uploads yet.</p> : <ul className="max-h-[60dvh] space-y-1 overflow-y-auto overscroll-contain touch-pan-y">
          {listedItems.map((item) => {
            const dayName = workshopGalleryDays.find((entry) => entry.id === item.dayId)?.label ?? (item.dayId === "overview" ? "Overview" : "Choose placement")
            const ready = item.uploadComplete && !!item.dayId && !!item.groupId
            return <li key={item.id} className="flex min-w-0 items-center gap-2 border-b border-border py-2 last:border-0">
              <div className="h-11 w-11 flex-none overflow-hidden rounded bg-muted">
                {item.kind === "video" || !item.thumbnail ? <div className="flex h-full items-center justify-center text-muted-foreground"><Video className="h-4 w-4" /></div> : <img src={previewSource(item.thumbnail)} alt="" className="h-full w-full object-cover" loading="lazy" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium" title={item.filename}>{item.title || item.filename}</p>
                <p className="truncate text-xs text-muted-foreground">{dayName}{item.groupTitle ? ` · ${item.groupTitle}` : ""}</p>
                <p className="text-[11px] text-muted-foreground">{item.published ? "Published" : "Draft"}{!item.uploadComplete ? " · upload unfinished" : ""}</p>
              </div>
              <div className="flex flex-none">
                <button disabled={busy} onClick={() => editItem(item)} className={actionClass} title="Edit placement and order" aria-label={`Edit ${item.title || item.filename}`}><Pencil className="h-4 w-4" /></button>
                <button disabled={busy || !ready} onClick={() => void setPublished(item, !item.published)} className={actionClass} title={item.published ? "Hide from gallery" : ready ? "Publish in gallery" : "Set placement before publishing"} aria-label={`${item.published ? "Hide" : "Publish"} ${item.title || item.filename}`}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button disabled={busy} onClick={() => void removeItem(item)} className={`${actionClass} hover:text-destructive`} title="Remove file" aria-label={`Remove ${item.title || item.filename}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          })}
        </ul>}
      </div>
    </div>
  )
}
