import type { NotificationItem } from "./program-data"

function createdTime(item: NotificationItem): number {
  const timestamp = Date.parse(item.created_at)
  return Number.isNaN(timestamp) ? -Infinity : timestamp
}

/** Keep the newest copy of each exact ID/title; published records win date ties. */
export function mergeAnnouncements(
  published: readonly NotificationItem[],
  bundled: readonly NotificationItem[],
): NotificationItem[] {
  const ids = new Set<string>()
  const titles = new Set<string>()
  return [...published, ...bundled]
    .sort((left, right) => createdTime(right) - createdTime(left) || 0)
    .filter(item => {
      if (ids.has(item.id) || titles.has(item.title)) return false
      ids.add(item.id)
      titles.add(item.title)
      return true
    })
}
