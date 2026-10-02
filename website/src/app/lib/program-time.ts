/** An empty end time means the agenda specifies only a start or departure. */
export function formatSessionTime(start: string, end?: string | null): string {
  const startLabel = start.slice(0, 5)
  return end ? `${startLabel} – ${end.slice(0, 5)}` : startLabel
}
