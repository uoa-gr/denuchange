import { useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, Download, LoaderCircle, X } from "lucide-react"
import { workshopGalleryDays, workshopGalleryOverview, type GalleryMedia } from "../lib/workshop-gallery-data"
import { downloadGalleryArchive, type GalleryArchiveFile } from "../lib/gallery-download"
import { SharedGallery } from "../components/SharedGallery"

interface GalleryEntry { media: GalleryMedia; day: string; group: string }
interface Viewer { items: GalleryMedia[]; index: number }

const mediaTypes = [
  { kind: "photo", label: "Images" },
  { kind: "collage", label: "Collages" },
  { kind: "video", label: "Videos" },
] as const

const assetUrl = (src: string) => /^https?:\/\//.test(src) ? src : `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`
const dayLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
const folderName = (name: string) => name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
const collection: GalleryEntry[] = [
  ...workshopGalleryDays.flatMap((day) => day.groups.flatMap((group) => group.items.map((media) => ({ media, day: day.id, group: `${day.id}/${group.id}` })))),
  ...workshopGalleryOverview.map((media) => ({ media, day: "overview", group: "film" })),
]

function archiveFiles(entries: GalleryEntry[]): GalleryArchiveFile[] {
  return entries.map(({ media, day, group }) => {
    const galleryDay = workshopGalleryDays.find((item) => item.id === day)
    const galleryGroup = galleryDay?.groups.find((item) => `${day}/${item.id}` === group)
    const path = galleryDay && galleryGroup
      ? `${galleryDay.label} - ${dayLabel(galleryDay.date)}/${folderName(galleryGroup.title)}/${media.kind === "collage" ? "Collages/" : ""}${media.filename}`
      : media.filename
    return { url: assetUrl(media.original), path, bytes: media.bytes }
  })
}

export function Gallery() {
  const [activeKind, setActiveKind] = useState<GalleryMedia["kind"]>("photo")
  const [activeDay, setActiveDay] = useState("all")
  const [activeGroup, setActiveGroup] = useState("all")
  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState(false)
  const gallery = useRef<HTMLDivElement | null>(null)
  const menu = useRef<HTMLDetailsElement | null>(null)
  const downloadController = useRef<AbortController | null>(null)
  const swipeStart = useRef<number | null>(null)
  const shared = activeDay === "shared"
  const kindEntries = collection.filter((item) => item.media.kind === activeKind)
  const dayEntries = activeDay === "all" ? kindEntries : kindEntries.filter((item) => item.day === activeDay)
  const entries = activeGroup === "all" ? dayEntries : dayEntries.filter((item) => item.group === activeGroup)
  const images = entries.map((entry) => entry.media)
  const current = viewer?.items[viewer.index]
  const kindDays = workshopGalleryDays.filter((day) => day.groups.some((group) => group.items.some((item) => item.kind === activeKind)))
  const availableDays = activeDay === "all" ? kindDays : kindDays.filter((day) => day.id === activeDay)

  useEffect(() => () => downloadController.current?.abort(), [])
  useEffect(() => { gallery.current?.closest("main")?.scrollTo({ top: 0 }) }, [activeKind, activeDay, activeGroup])

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
              if (shared || activeDay !== "all" && !workshopGalleryDays.some((day) => day.id === activeDay && day.groups.some((group) => group.items.some((item) => item.kind === kind)))) setActiveDay("all")
            }}
            className={`flex-1 py-2 text-xs font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeKind === kind ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >{label}</button>)}
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
        <select
          aria-label="Day"
          value={activeDay}
          onChange={(event) => { setActiveDay(event.target.value); setActiveGroup("all") }}
          className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All days</option>
          {kindDays.map((day) => <option key={day.id} value={day.id}>{day.label} · {dayLabel(day.date)}</option>)}
          {activeKind === "photo" && <option value="shared">Shared photos</option>}
        </select>
        {!shared && <select
          aria-label="Group"
          value={activeGroup}
          onChange={(event) => setActiveGroup(event.target.value)}
          className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All groups</option>
          {activeKind === "video" && activeDay === "all" && <option value="film">Workshop video</option>}
          {availableDays.map((day) => <optgroup key={day.id} label={`${day.label} · ${dayLabel(day.date)}`}>{day.groups.filter((group) => group.items.some((item) => item.kind === activeKind)).map((group) => <option key={group.id} value={`${day.id}/${group.id}`}>{group.title}</option>)}</optgroup>)}
        </select>}
        {!shared && <details ref={menu} className="relative flex-none">
          <summary aria-label="Downloads" title={progress === null ? "Downloads" : `Preparing download: ${progress}%`} className="list-none [&::-webkit-details-marker]:hidden cursor-pointer p-2 rounded text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {progress === null ? <Download className="h-4 w-4" /> : <LoaderCircle className="h-4 w-4 animate-spin" />}
          </summary>
          <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border bg-background shadow-md py-1 text-xs">
            {progress !== null ? <button onClick={() => { downloadController.current?.abort(); if (menu.current) menu.current.open = false }} className="block w-full px-3 py-2 text-left hover:bg-muted">Cancel download ({progress}%)</button> : <>
              {activeGroup !== "all" && <button onClick={() => void download(entries, `DENUCHANGE-${activeGroup.replace("/", "-")}-${activeKind}.zip`)} className="block w-full px-3 py-2 text-left hover:bg-muted">Download group</button>}
              {activeDay !== "all" && <button onClick={() => void download(dayEntries, `DENUCHANGE-${activeDay}-${activeKind}.zip`)} className="block w-full px-3 py-2 text-left hover:bg-muted">Download day</button>}
              <button onClick={() => void download(collection, "DENUCHANGE-Naxos-2026.zip")} className="block w-full px-3 py-2 text-left hover:bg-muted">Download all</button>
            </>}
          </div>
        </details>}
        </div>
      </div>
      {downloadError && <p role="alert" className="px-3 py-2 text-xs text-destructive">Download failed. Please try again.</p>}

      {shared ? <SharedGallery onOpen={(items, index) => setViewer({ items, index })} /> : <div className="p-1 grid grid-cols-2 sm:grid-cols-3 gap-1">
        {images.map((item, index) => item.kind === "video" ? (
          <video key={item.id} controls playsInline preload="none" poster={assetUrl(item.poster ?? item.thumbnail)} aria-label={item.title} title={item.title} className="block w-full aspect-[4/3] rounded bg-black object-contain" width={item.width} height={item.height}>
            <source src={assetUrl(item.src)} type="video/mp4" />
            <a href={assetUrl(item.original)} download={item.filename}>Download video</a>
          </video>
        ) : (
          <button key={item.id} onClick={() => setViewer({ items: images, index })} aria-label={`Open ${item.title}`} title={item.title} className="block w-full aspect-[4/3] rounded overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary">
            <img src={assetUrl(item.thumbnail)} alt={item.title} width={item.width} height={item.height} loading="lazy" decoding="async" className={`w-full h-full ${item.kind === "collage" ? "object-contain" : "object-cover"}`} />
          </button>
        ))}
      </div>}

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
                {current.kind === "video" ? <video key={current.id} controls playsInline autoPlay poster={assetUrl(current.poster ?? current.thumbnail)} className="max-w-full max-h-full"><source src={assetUrl(current.src)} type="video/mp4" /></video> : <img key={current.id} src={assetUrl(current.src)} alt={current.title} className="max-w-full max-h-full w-auto h-auto object-contain [content-visibility:visible]" />}
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
