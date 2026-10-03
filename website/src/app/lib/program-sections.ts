import type { ProgramSession } from "./program-data"

export interface ProgramSectionHeading {
  key: string
  date: string
  label: string
  title: string
  subtitle?: string
  chairs?: string
}

export interface ProgramScheduleItem {
  session: ProgramSession
  displayedDescription: string
}

export interface ProgramSection {
  key: string
  date: string
  heading?: ProgramSectionHeading
  items: ProgramScheduleItem[]
}

/** A final balanced parenthetical supplies the subtitle, including nested parentheses. */
function splitSessionTitle(value: string): { title: string; subtitle?: string } {
  if (!value.endsWith(")")) return { title: value }
  let depth = 0
  for (let index = value.length - 1; index >= 0; index -= 1) {
    if (value[index] === ")") depth += 1
    if (value[index] === "(") depth -= 1
    if (depth === 0) {
      const title = value.slice(0, index).trim()
      const subtitle = value.slice(index + 1, -1).trim()
      if (title && subtitle && /\s/u.test(value[index - 1] ?? "")) return { title, subtitle }
      break
    }
  }
  return { title: value }
}

function readSessionMetadata(session: ProgramSession): {
  heading?: ProgramSectionHeading
  displayedDescription: string
} {
  const description = session.description ?? ""
  const lines = description.split(/\r?\n/u)
  const sessionPattern = /^\s*(Session\s+[^:]+):\s*(.+?)\s*$/iu
  const sessionLine = lines.map(line => line.match(sessionPattern)).find(Boolean)
  if (!sessionLine) return { displayedDescription: description }

  const label = sessionLine[1].trim().replace(/\s+/gu, " ")
  const title = splitSessionTitle(sessionLine[2].trim())
  const chairsPattern = /^\s*Chairs:\s*(.*?)\s*$/iu
  const chairs = lines.map(line => line.match(chairsPattern)?.[1]).find(value => Boolean(value))
  const displayedDescription = lines
    .filter(line => !sessionPattern.test(line) && !chairsPattern.test(line))
    .join("\n")
    .replace(/\n(?:[ \t]*\n){2,}/gu, "\n\n")
    .trim()

  return {
    heading: {
      key: `${session.date}:${label.normalize("NFC").toLowerCase()}`,
      date: session.date,
      label,
      ...title,
      ...(chairs ? { chairs } : {}),
    },
    displayedDescription,
  }
}

/** Preserve source order and objects; only untagged discussions inherit a thematic group. */
export function groupProgramSessions(sessions: readonly ProgramSession[]): ProgramSection[] {
  const parsed = sessions.map(session => ({ session, ...readSessionMetadata(session) }))
  const headings = new Map<string, ProgramSectionHeading>()

  // Metadata can be supplied on any tagged row, so gather it before creating sections.
  for (const { heading } of parsed) {
    if (!heading) continue
    const existing = headings.get(heading.key)
    headings.set(heading.key, existing ? {
      ...existing,
      subtitle: existing.subtitle || heading.subtitle,
      chairs: existing.chairs || heading.chairs,
    } : heading)
  }

  const sections: ProgramSection[] = []
  let current: ProgramSection | undefined
  for (const [index, item] of parsed.entries()) {
    const heading = item.heading ? headings.get(item.heading.key) : (
      /^discussion$/iu.test(item.session.title.trim()) && current?.heading?.date === item.session.date
        ? current.heading
        : undefined
    )
    if (!current || current.date !== item.session.date || current.heading?.key !== heading?.key) {
      current = {
        key: `${heading?.key ?? `${item.session.date}:standalone`}:${index}`,
        date: item.session.date,
        ...(heading ? { heading } : {}),
        items: [],
      }
      sections.push(current)
    }
    current.items.push({ session: item.session, displayedDescription: item.displayedDescription })
  }
  return sections
}
