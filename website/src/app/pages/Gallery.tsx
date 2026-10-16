import { useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Download, LoaderCircle, Settings2, X } from "lucide-react"
import { workshopGalleryDays, workshopGalleryOverview, type GalleryMedia } from "../lib/workshop-gallery-data"
import { downloadGalleryArchive, type GalleryArchiveFile } from "../lib/gallery-download"
import { getPublishedGalleryItems, type ManagedGalleryItem } from "../lib/gallery-admin-api"
import { localGalleryStore } from "../lib/gallery-local-preview"
import { useAuth } from "../lib/auth"

interface GalleryEntry { media: GalleryMedia; day: string; group: string; groupTitle: string; groupOrder: number; position: number }
interface Viewer { items: GalleryMedia[]; index: number }
type GalleryFormat = "all" | "original" | "mobile"

const mediaTypes = [
  { kind: "photo", label: "Images" },
  { kind: "collage", label: "Collages" },
  { kind: "video", label: "Videos" },
] as const

const assetUrl = (src: string) => /^(https?:|blob:|data:)/.test(src) ? src : `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`
const dayLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
const folderName = (name: string) => name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
const isPortrait = (media: GalleryMedia) => media.width > 0 && media.height > media.width
const matchesFormat = (media: GalleryMedia, format: GalleryFormat) => format === "all" || (format === "mobile" ? media.variant === "mobile" : media.variant !== "mobile")
const staticCollection: GalleryEntry[] = [
  ...workshopGalleryDays.flatMap((day) => day.groups.flatMap((group, groupOrder) => group.items.map((media, index) => ({ media, day: day.id, group: `${day.id}/${group.id}`, groupTitle: group.title, groupOrder, position: index + 1 })))),
  ...workshopGalleryOverview.map((media, index) => ({ media, day: "overview", group: "film", groupTitle: "Workshop video", groupOrder: 0, position: index + 1 })),
]
const dayOrder = (day: string) => day === "overview" ? workshopGalleryDays.length : workshopGalleryDays.findIndex((item) => item.id === day)

function archiveFiles(entries: GalleryEntry[]): GalleryArchiveFile[] {
  return entries.map(({ media, day, groupTitle }) => {
    const galleryDay = workshopGalleryDays.find((item) => item.id === day)
    const path = galleryDay
      ? `${galleryDay.label} - ${dayLabel(galleryDay.date)}/${folderName(groupTitle)}/${media.kind === "collage" ? "Collages/" : ""}${media.filename}`
      : media.filename
    return { url: assetUrl(media.original), path, bytes: media.bytes }
  })
}

export function Gallery() {
  const { user } = useAuth()
  const localPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "gallery"
  return <WorkshopGallery canManage={!!user?.isAdmin} localPreview={localPreview} />
}

export function WorkshopGallery({ canManage = false, localPreview = false }: { canManage?: boolean; localPreview?: boolean }) {
  const [uploads, setUploads] = useState<ManagedGalleryItem[]>([])
  const [activeKind, setActiveKind] = useState<GalleryMedia["kind"]>("photo")
  const [activeDay, setActiveDay] = useState("all")
  const [activeGroup, setActiveGroup] = useState("all")
  const [activeFormat, setActiveFormat] = useState<GalleryFormat>("all")
  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState(false)
  const gallery = useRef<HTMLDivElement | null>(null)
  const menu = useRef<HTMLDetailsElement | null>(null)
  const downloadController = useRef<AbortController | null>(null)
  const swipeStart = useRef<number | null>(null)
  const collection: GalleryEntry[] = [
    ...staticCollection,
    ...uploads.filter((item) => item.published && item.uploadComplete && item.dayId && item.groupId && item.groupTitle).map((item) => ({ media: item, day: item.dayId!, group: item.dayId === "overview" ? "film" : `${item.dayId}/${item.groupId}`, groupTitle: item.groupTitle!, groupOrder: item.groupOrder, position: item.position })),
  ].sort((a, b) => dayOrder(a.day) - dayOrder(b.day) || a.groupOrder - b.groupOrder || a.position - b.position || a.media.id.localeCompare(b.media.id))
  const unfilteredKindEntries = collection.filter((item) => item.media.kind === activeKind)
  const hasFormats = activeKind !== "photo" && unfilteredKindEntries.some((item) => item.media.variant === "mobile") && unfilteredKindEntries.some((item) => item.media.variant !== "mobile")
  const selectedFormat = hasFormats ? activeFormat : "all"
  const kindEntries = unfilteredKindEntries.filter((item) => matchesFormat(item.media, selectedFormat))
  const dayEntries = activeDay === "all" ? kindEntries : kindEntries.filter((item) => item.day === activeDay)
  const entries = activeGroup === "all" ? dayEntries : dayEntries.filter((item) => item.group === activeGroup)
  const images = entries.map((entry) => entry.media)
  const current = viewer?.items[viewer.index]
  const kindDays = workshopGalleryDays.filter((day) => kindEntries.some((item) => item.day === day.id))
  const availableDays = activeDay === "all" ? kindDays : kindDays.filter((day) => day.id === activeDay)
  const groupsForDay = (dayId: string) => Array.from(new Map(kindEntries.filter((item) => item.day === dayId).map((item) => [item.group, { id: item.group, title: item.groupTitle }])).values())
  const downloadSuffix = `${activeKind}${selectedFormat === "all" ? "" : `-${selectedFormat}`}`

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const load = async () => {
      try {
        const items = localPreview ? await localGalleryStore.list() : await getPublishedGalleryItems(controller.signal)
        if (active) setUploads(items.filter((item) => item.published))
      } catch { /* The prepared workshop collection remains available. */ }
    }
    void load()
    window.addEventListener("denuchange-gallery-change", load)
    return () => { active = false; controller.abort(); window.removeEventListener("denuchange-gallery-change", load) }
  }, [localPreview])

  useEffect(() => () => downloadController.current?.abort(), [])
  useEffect(() => {
    const element = gallery.current
    const main = element?.closest("main")
    if (!element || !main) return
    if (main.scrollHeight > main.clientHeight) main.scrollTo({ top: 0 })
    else {
      const top = element.getBoundingClientRect().top + window.scrollY
      if (window.scrollY > top) window.scrollTo({ top })
    }
  }, [activeKind, activeDay, activeGroup, activeFormat])

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current) menu.current.open = false
      if (!viewer || event.target instanceof HTMLElement && event.target.tagName === "VIDEO") return
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault()
        setViewer((state) => state ? { ...state, index: Math.max(0, Math.min(state.items.length - 1, state.index + (event.key === "ArrowLeft" ? -1 : 1))) } : null)
      }
    }
    document.addEventListener("pointerdown", closeMenu)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("pointerdown", closeMenu)
      document.removeEventListener("keydown", handleKey)
    }
  }, [viewer])

  function move(offset: number) {
    setViewer((state) => state ? { ...state, index: Math.max(0, Math.min(state.items.length - 1, state.index + offset)) } : null)
  }

  async function download(entriesToDownload: GalleryEntry[], filename: string) {
    if (downloadController.current) return
    if (menu.current) menu.current.open = false
    const controller = new AbortController()
    downloadController.current = controller
    setDownloadError(false)
    setProgress(0)
    try {
      await downloadGalleryArchive(archiveFiles(entriesToDownload), filename, {
        signal: controller.signal,
        onProgress: (loaded, total) => setProgress(Math.round(loaded / Math.max(total, 1) * 100)),
      })
    } catch (error) {
      if (!controller.signal.aborted && !(error instanceof DOMException && error.name === "AbortError")) setDownloadError(true)
    } finally {
      downloadController.current = null
      setProgress(null)
    }
  }

  return (
    <div ref={gallery} className="max-w-5xl mx-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex border-b border-border" role="group" aria-label="Media type">
          {mediaTypes.map(({ kind, label }) => <button
            key={kind}
            aria-pressed={activeKind === kind}
            onClick={() => {
              setActiveKind(kind)
              setActiveGroup("all")
              setActiveFormat("all")
              if (activeDay !== "all" && !collection.some((item) => item.day === activeDay && item.media.kind === kind)) setActiveDay("all")
            }}
            className={`flex-1 py-2 text-xs font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeKind === kind ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >{label}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <select
          aria-label="Day"
          value={activeDay}
          onChange={(event) => { setActiveDay(event.target.value); setActiveGroup("all") }}
          className="min-w-0 w-0 flex-1 min-h-11 rounded border border-border bg-background px-2 py-2 text-base sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All days</option>
          {kindDays.map((day) => <option key={day.id} value={day.id}>{day.label} · {dayLabel(day.date)}</option>)}
        </select>
        <select
          aria-label="Group"
          value={activeGroup}
          onChange={(event) => setActiveGroup(event.target.value)}
          className="min-w-0 w-0 flex-1 min-h-11 rounded border border-border bg-background px-2 py-2 text-base sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All groups</option>
          {activeKind === "video" && activeDay === "all" && <option value="film">Workshop video</option>}
          {availableDays.map((day) => <optgroup key={day.id} label={`${day.label} · ${dayLabel(day.date)}`}>{groupsForDay(day.id).map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</optgroup>)}
        </select>
        {hasFormats && <select
          aria-label="Format"
          value={activeFormat}
          onChange={(event) => {
            const format = event.target.value as GalleryFormat
            setActiveFormat(format)
            setActiveGroup("all")
            if (activeDay !== "all" && !unfilteredKindEntries.some((item) => item.day === activeDay && matchesFormat(item.media, format))) setActiveDay("all")
          }}
          className="order-last min-w-0 w-full sm:order-none sm:w-0 sm:flex-1 min-h-11 rounded border border-border bg-background px-2 py-2 text-base sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All formats</option>
          <option value="original">Landscape</option>
          <option value="mobile">Mobile (9:16)</option>
        </select>}
        {(canManage || localPreview) && <Link to={localPreview ? "/app/admin?preview=gallery-admin" : "/app/admin?tab=gallery"} aria-label="Manage gallery" title="Manage gallery" className="h-11 w-11 flex-none flex items-center justify-center rounded text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Settings2 className="h-4 w-4" /></Link>}
        <details ref={menu} className="relative flex-none">
          <summary aria-label="Downloads" title={progress === null ? "Downloads" : `Preparing download: ${progress}%`} className="list-none [&::-webkit-details-marker]:hidden cursor-pointer h-11 w-11 flex items-center justify-center rounded text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {progress === null ? <Download className="h-4 w-4" /> : <LoaderCircle className="h-4 w-4 animate-spin" />}
          </summary>
          <div className="absolute right-0 top-full mt-1 w-44 max-h-[60dvh] overflow-y-auto overscroll-contain touch-pan-y rounded-md border border-border bg-background shadow-md py-1 text-xs">
            {progress !== null ? <button onClick={() => { downloadController.current?.abort(); if (menu.current) menu.current.open = false }} className="block w-full px-3 py-2 text-left hover:bg-muted">Cancel download ({progress}%)</button> : <>
              {activeGroup === "all" && activeDay === "all" && <button onClick={() => void download(entries, `DENUCHANGE-Naxos-2026-${downloadSuffix}.zip`)} className="block w-full px-3 py-2 text-left hover:bg-muted">Download selection</button>}
              {activeGroup !== "all" && <button onClick={() => void download(entries, `DENUCHANGE-${activeGroup.replace("/", "-")}-${downloadSuffix}.zip`)} className="block w-full px-3 py-2 text-left hover:bg-muted">Download group</button>}
              {activeDay !== "all" && <button onClick={() => void download(dayEntries, `DENUCHANGE-${activeDay}-${downloadSuffix}.zip`)} className="block w-full px-3 py-2 text-left hover:bg-muted">Download day</button>}
              <button onClick={() => void download(collection, "DENUCHANGE-Naxos-2026.zip")} className="block w-full px-3 py-2 text-left hover:bg-muted">Download all</button>
            </>}
          </div>
        </details>
        </div>
      </div>
      {downloadError && <p role="alert" className="px-3 py-2 text-xs text-destructive">Download failed. Please try again.</p>}

      <div className="p-1 grid grid-cols-2 sm:grid-cols-3 gap-1">
        {images.map((item, index) => item.kind === "video" ? (
          <video key={item.id} controls playsInline preload="none" poster={item.poster || item.thumbnail ? assetUrl(item.poster || item.thumbnail) : undefined} aria-label={item.title} title={item.title} className={`block w-full self-start rounded bg-black object-contain ${isPortrait(item) ? "justify-self-center" : ""}`} style={{ aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : "16 / 9", ...(isPortrait(item) ? { maxWidth: `min(100%, ${70 * item.width / item.height}dvh)` } : {}) }} width={item.width || undefined} height={item.height || undefined}>
            <source src={assetUrl(item.src)} type="video/mp4" />
            <a href={assetUrl(item.original)} download={item.filename}>Download video</a>
          </video>
        ) : (
          <button key={item.id} onClick={() => setViewer({ items: images, index })} aria-label={`Open ${item.title}`} title={item.title} className="relative block w-full aspect-[4/3] rounded overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary">
            {item.kind === "collage" && <img src={assetUrl(item.thumbnail)} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full scale-110 object-cover blur-lg brightness-[0.78] saturate-90" />}
            <img src={assetUrl(item.thumbnail)} alt={item.title} width={item.width} height={item.height} loading="lazy" decoding="async" className={`relative w-full h-full ${item.kind === "collage" ? "object-contain" : "object-cover"}`} />
          </button>
        ))}
      </div>

      <Dialog.Root open={!!viewer} onOpenChange={(open) => { if (!open) setViewer(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/95" />
          <Dialog.Content className="fixed inset-0 z-50 h-[100dvh] flex flex-col text-white outline-none">
            {viewer && current && <>
              <div className="flex-none flex items-center gap-3 px-3 py-2 pt-safe">
                <Dialog.Title className="flex-1 min-w-0 truncate text-xs font-normal text-white/80">{current.title}</Dialog.Title>
                <a href={assetUrl(current.original)} download={current.filename} aria-label="Download original" title="Download original" className="p-2 rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Download className="h-5 w-5" /></a>
                <Dialog.Close aria-label="Close" className="p-2 rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><X className="h-5 w-5" /></Dialog.Close>
              </div>
              <div className="relative flex-1 min-h-0 flex items-center justify-center px-10"
                onTouchStart={(event) => { swipeStart.current = current.kind === "video" ? null : event.touches[0].clientX }}
                onTouchEnd={(event) => { if (swipeStart.current !== null) { const delta = event.changedTouches[0].clientX - swipeStart.current; if (Math.abs(delta) > 60) move(delta > 0 ? -1 : 1); swipeStart.current = null } }}
              >
                {current.kind === "video" ? <video key={current.id} controls playsInline autoPlay poster={current.poster || current.thumbnail ? assetUrl(current.poster || current.thumbnail) : undefined} className="max-w-full max-h-full"><source src={assetUrl(current.src)} type="video/mp4" /></video> : <img key={current.id} src={assetUrl(current.src)} alt={current.title} className="max-w-full max-h-full w-auto h-auto object-contain [content-visibility:visible]" />}
                {viewer.items.length > 1 && <>
                  <button onClick={() => move(-1)} disabled={viewer.index === 0} aria-label="Previous" className="absolute left-1 p-2 rounded bg-black/40 disabled:opacity-20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => move(1)} disabled={viewer.index === viewer.items.length - 1} aria-label="Next" className="absolute right-1 p-2 rounded bg-black/40 disabled:opacity-20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ChevronRight className="h-5 w-5" /></button>
                </>}
              </div>
              <Dialog.Description className="flex-none text-center text-xs text-white/60 py-3 pb-safe">{viewer.index + 1} / {viewer.items.length}</Dialog.Description>
            </>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
