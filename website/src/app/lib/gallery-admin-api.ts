import type { GalleryMedia } from "./workshop-gallery-data"

export interface GalleryPlacement {
  dayId: string
  groupId: string
  groupTitle: string
  groupOrder: number
  kind: GalleryMedia["kind"]
  position: number
  title?: string
}

export interface ManagedGalleryItem extends GalleryMedia {
  dayId: string | null
  groupId: string | null
  groupTitle: string | null
  groupOrder: number
  position: number
  published: boolean
  uploadComplete: boolean
}

export interface GalleryUpload {
  id: string
  path: string
  token: string
  mimeType: string
  previewUpload?: { path: string; token: string; mimeType: string }
}

async function galleryFetch<T>(action: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/app/gallery?action=${action}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.error || "The gallery could not be updated. Please try again.")
    Object.assign(error, { status: response.status })
    throw error
  }
  return data as T
}

export const galleryAdminApi = {
  list: () => galleryFetch<ManagedGalleryItem[]>("manage"),
  prepare: (file: { name: string; size: number }, placement: GalleryPlacement) =>
    galleryFetch<GalleryUpload>("prepare", { method: "POST", body: JSON.stringify({ file, placement }) }),
  complete: (id: string, width: number, height: number) =>
    galleryFetch<ManagedGalleryItem>("complete", { method: "POST", body: JSON.stringify({ id, width, height }) }),
  update: (id: string, placement: GalleryPlacement & { published?: boolean }) =>
    galleryFetch<ManagedGalleryItem>("update", { method: "PATCH", body: JSON.stringify({ id, ...placement }) }),
  remove: (id: string) =>
    galleryFetch<void>("remove", { method: "DELETE", body: JSON.stringify({ id }) }),
}

export function getPublishedGalleryItems(signal?: AbortSignal): Promise<ManagedGalleryItem[]> {
  return galleryFetch<ManagedGalleryItem[]>("published", { signal })
}
