// Universal Calendar & Reminder Generator for DENUCHANGE Attendee App
// Supports Apple Calendar (iOS / macOS), Google Calendar, Outlook, and Android native calendars.
// Generates RFC 5545 compliant .ics files with built-in 15-minute alarm triggers.

import type { ProgramSession } from "./program-data"

const VENUE_FALLBACK = "Laguna Coast Resort, Naxos, Greece"

/**
 * Converts date ('YYYY-MM-DD') and time ('HH:mm') in Greece time (EEST, UTC+3)
 * into an RFC 5545 UTC timestamp (e.g. '20261006T063000Z').
 */
export function formatUtcIcsDate(dateStr: string, timeStr: string): string {
  const cleanTime = timeStr.trim().slice(0, 5)
  const isoWithTz = `${dateStr}T${cleanTime}:00+03:00`
  const d = new Date(isoWithTz)
  if (isNaN(d.getTime())) {
    // Fallback if parsing fails
    const [y, m, day] = dateStr.split("-")
    const [h, min] = cleanTime.split(":")
    return `${y}${m}${day}T${h}${min}00Z`
  }
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

/**
 * Builds the RFC 5545 VEVENT block for a single session with a 15-minute alarm.
 */
function buildVEvent(session: ProgramSession, nowUtc: string): string {
  const startUtc = formatUtcIcsDate(session.date, session.start_time)
  const endUtc = formatUtcIcsDate(session.date, session.end_time)
  const location = session.location || VENUE_FALLBACK
  const description = session.description ? `${session.description}\n\nVenue: ${location}` : session.title

  return [
    "BEGIN:VEVENT",
    `UID:denuchange-${session.id}@denuchange.vercel.app`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcs(session.title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${escapeIcs(session.title)}`,
    "END:VALARM",
    "END:VEVENT",
  ].join("\r\n")
}

/**
 * Generates a full .ics iCalendar file for a single workshop session.
 */
export function generateSessionIcs(session: ProgramSession): string {
  const nowUtc = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const eventBlock = buildVEvent(session, nowUtc)

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DENUCHANGE 2026 Workshop//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:DENUCHANGE 2026 - ${session.title.slice(0, 40)}`,
    "X-WR-TIMEZONE:Europe/Athens",
    eventBlock,
    "END:VCALENDAR",
  ].join("\r\n")
}

/**
 * Generates a full .ics iCalendar file for multiple sessions (e.g. an entire day's agenda).
 */
export function generateDayIcs(sessions: ProgramSession[], calendarTitle = "DENUCHANGE 2026 Workshop"): string {
  const nowUtc = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const events = sessions.map((s) => buildVEvent(s, nowUtc)).join("\r\n")

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DENUCHANGE 2026 Workshop//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarTitle}`,
    "X-WR-TIMEZONE:Europe/Athens",
    events,
    "END:VCALENDAR",
  ].join("\r\n")
}

/**
 * Triggers universal download / opening of the .ics file on iOS, Android, Mac, or Windows.
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Returns a 1-click Google Calendar deep link for a session.
 */
export function getGoogleCalendarUrl(session: ProgramSession): string {
  const startUtc = formatUtcIcsDate(session.date, session.start_time)
  const endUtc = formatUtcIcsDate(session.date, session.end_time)
  const location = session.location || VENUE_FALLBACK
  const details = session.description ? `${session.description}\n\nVenue: ${location}` : session.title

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: session.title,
    dates: `${startUtc}/${endUtc}`,
    details: details,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
