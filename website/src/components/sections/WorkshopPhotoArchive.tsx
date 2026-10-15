import { Link } from "react-router-dom"
import { workshopGalleryDays } from "@/app/lib/workshop-gallery-data"

const featuredGroups = [
  ["day-1", "opening"],
  ["day-3", "flerio-kouros"],
  ["day-1", "laguna"],
  ["day-2", "posters"],
  ["day-4", "alyko"],
]

const featuredPhotos = featuredGroups.flatMap(([dayId, groupId]) => {
  const day = workshopGalleryDays.find((item) => item.id === dayId)
  const photo = day?.groups.find((group) => group.id === groupId)?.items.find((item) => item.kind === "photo")
    ?? day?.groups.flatMap((group) => group.items).find((item) => item.kind === "photo")
  return photo ? [photo] : []
})

export function WorkshopPhotoArchive() {
  return (
    <section aria-labelledby="workshop-photo-archive-heading" className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 id="workshop-photo-archive-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Workshop Photo Archive
        </h2>

        <Link
          to="/photo-archive"
          aria-label="View the workshop photo archive"
          className="relative mx-auto mt-7 block h-[clamp(12rem,35vw,20rem)] max-w-4xl rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
        >
          {featuredPhotos.map((photo, index) => {
            const offset = index - 2
            return (
              <span
                key={photo.id}
                className="absolute block aspect-[4/3] w-[36%] max-w-80 overflow-hidden rounded-xl border-4 border-white bg-muted shadow-[0_8px_24px_-8px_rgba(15,23,42,0.3)] sm:rounded-2xl sm:border-[5px]"
                style={{
                  left: `${18 + index * 16}%`,
                  top: `${12 + (2 - Math.abs(offset)) * 12}px`,
                  transform: `translateX(-50%) rotate(${offset * 4}deg)`,
                  zIndex: 3 - Math.abs(offset),
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}${photo.thumbnail.replace(/^\//, "")}`}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </span>
            )
          })}
        </Link>

        <Link
          to="/photo-archive"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
        >
          View all photos
        </Link>
      </div>
    </section>
  )
}
