import type { GalleryPlacement, ManagedGalleryItem } from "./gallery-admin-api"

interface LocalGalleryFile extends GalleryPlacement {
  id: string
  file: File
  preview?: Blob
  width: number
  height: number
  published: boolean
}

const urls = new Map<string, { original: string; thumbnail: string }>()
let database: Promise<IDBDatabase> | undefined

function openDatabase() {
  if (!import.meta.env.DEV) throw new Error("Local gallery preview is unavailable.")
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("denuchange-gallery-preview", 1)
    request.onupgradeneeded = () => request.result.createObjectStore("files", { keyPath: "id" })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error("Could not open local gallery storage."))
  })
  return database
}

async function readFiles(): Promise<LocalGalleryFile[]> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction("files").objectStore("files").getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error("Could not load local gallery files."))
  })
}

async function saveFile(file: LocalGalleryFile | string) {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("files", "readwrite")
    const store = transaction.objectStore("files")
    if (typeof file === "string") store.delete(file)
    else store.put(file)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error("Could not save the local gallery change."))
    transaction.onabort = () => reject(new Error("Local gallery storage is full or unavailable."))
  })
  window.dispatchEvent(new Event("denuchange-gallery-change"))
}

function toItem(file: LocalGalleryFile): ManagedGalleryItem {
  let sources = urls.get(file.id)
  if (!sources) {
    const original = URL.createObjectURL(file.file)
    sources = { original, thumbnail: file.preview ? URL.createObjectURL(file.preview) : file.kind === "video" ? "" : original }
    urls.set(file.id, sources)
  }
  return {
    id: file.id, kind: file.kind, title: file.title || file.file.name,
    filename: file.file.name, src: file.kind === "video" ? sources.original : sources.thumbnail,
    thumbnail: sources.thumbnail, original: sources.original, bytes: file.file.size,
    width: file.width, height: file.height,
    dayId: file.dayId, groupId: file.groupId, groupTitle: file.groupTitle,
    groupOrder: file.groupOrder, position: file.position,
    published: file.published, uploadComplete: true,
  }
}

export const localGalleryStore = {
  async list(): Promise<ManagedGalleryItem[]> {
    return (await readFiles()).map(toItem)
  },

  async upload(file: File, placement: GalleryPlacement): Promise<ManagedGalleryItem> {
    const record: LocalGalleryFile = { ...placement, id: crypto.randomUUID(), file, width: 0, height: 0, published: false }
    if (placement.kind !== "video") {
      const bitmap = await createImageBitmap(file)
      try {
        record.width = bitmap.width
        record.height = bitmap.height
        const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(bitmap.width * scale))
        canvas.height = Math.max(1, Math.round(bitmap.height * scale))
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        record.preview = await new Promise<Blob | undefined>((resolve) => canvas.toBlob((blob) => resolve(blob ?? undefined), "image/webp", 0.85))
      } finally { bitmap.close() }
    }
    await saveFile(record)
    return toItem(record)
  },

  async update(id: string, placement: GalleryPlacement & { published?: boolean }): Promise<ManagedGalleryItem> {
    const record = (await readFiles()).find((file) => file.id === id)
    if (!record) throw new Error("This local upload could not be found.")
    const updated = { ...record, ...placement }
    await saveFile(updated)
    return toItem(updated)
  },

  async remove(id: string): Promise<void> {
    await saveFile(id)
    const sources = urls.get(id)
    if (sources) {
      URL.revokeObjectURL(sources.original)
      if (sources.thumbnail && sources.thumbnail !== sources.original) URL.revokeObjectURL(sources.thumbnail)
      urls.delete(id)
    }
  },
}
