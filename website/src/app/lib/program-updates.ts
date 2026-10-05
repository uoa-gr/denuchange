import { DEFAULT_PROGRAM_SESSIONS, type ProgramSession } from "./program-data"

const TUESDAY_DATE = "2026-10-06"
const TUESDAY_BUS = DEFAULT_PROGRAM_SESSIONS.find(session => session.id === "tue-bus")!
const TUESDAY_PARALLEL_EVENT = DEFAULT_PROGRAM_SESSIONS.find(session => session.id === "tue-conversation-in-stone")!
const FIRST_TUESDAY_SESSION = DEFAULT_PROGRAM_SESSIONS.find(session => session.id === "tue-s1-2")!
const CANCELLED_PRESENTATION = "SWAT-based modelling of water runoff and suspended sediment transport in catchments across diverse morphoclimatic zones"

/** Apply the published Tuesday changes to existing server records as well as bundled data. */
function applyPublishedProgramUpdates(sessions: ProgramSession[]): ProgramSession[] {
  let hasTuesdayBus = false
  let hasTuesdayParallelEvent = false
  const updated = sessions.flatMap(session => {
    const title = session.title.trim()
    if (
      session.id === TUESDAY_PARALLEL_EVENT.id ||
      (session.date === TUESDAY_DATE && title === TUESDAY_PARALLEL_EVENT.title)
    ) {
      if (hasTuesdayParallelEvent) return []
      hasTuesdayParallelEvent = true
      return [{ ...TUESDAY_PARALLEL_EVENT, id: session.id }]
    }
    if (session.date !== TUESDAY_DATE) return [session]
    if (session.id === "tue-reg" || title === "Registration") return []
    if (session.id === "tue-s1-1" || title === CANCELLED_PRESENTATION) return []
    if (
      session.id === "tue-s1-1-disc" ||
      (title === "Discussion" && session.start_time.slice(0, 5) === "11:50" && session.end_time.slice(0, 5) === "11:55")
    ) return []
    if (session.id === TUESDAY_BUS.id || title === TUESDAY_BUS.title) {
      hasTuesdayBus = true
      return [{ ...TUESDAY_BUS, id: session.id }]
    }
    if (session.id === FIRST_TUESDAY_SESSION.id || title === FIRST_TUESDAY_SESSION.title) {
      return [{ ...session, description: FIRST_TUESDAY_SESSION.description }]
    }
    return [session]
  })
  if (!hasTuesdayBus) updated.push(TUESDAY_BUS)
  if (!hasTuesdayParallelEvent) updated.push(TUESDAY_PARALLEL_EVENT)
  return updated.sort((left, right) => left.date.localeCompare(right.date) || left.start_time.localeCompare(right.start_time))
}

interface ProgramUpdateOptions {
  loadSessions: () => Promise<ProgramSession[]>
  onSessions: (sessions: ProgramSession[]) => void
  onReady: () => void
}

interface ProgramUpdateEnvironment {
  window: Pick<Window, "addEventListener" | "removeEventListener" | "setInterval" | "clearInterval">
  document: Pick<Document, "visibilityState" | "addEventListener" | "removeEventListener">
  navigator: Pick<Navigator, "onLine">
}

/** Keep an open Program view current while preserving its last usable schedule. */
export function startProgramUpdates(
  { loadSessions, onSessions, onReady }: ProgramUpdateOptions,
  environment: ProgramUpdateEnvironment = { window, document, navigator },
): () => void {
  let disposed = false
  let pending = false
  let hasDisplayedSessions = false
  let ready = false

  const refresh = async () => {
    if (disposed || pending) return
    pending = true

    try {
      const sessions = await loadSessions()
      if (disposed) return
      onSessions(applyPublishedProgramUpdates(sessions.length > 0 ? sessions : DEFAULT_PROGRAM_SESSIONS))
      hasDisplayedSessions = true
    } catch {
      if (!disposed && !hasDisplayedSessions) {
        onSessions(DEFAULT_PROGRAM_SESSIONS)
        hasDisplayedSessions = true
      }
    } finally {
      pending = false
      if (!disposed && !ready) {
        ready = true
        onReady()
      }
    }
  }

  const refreshVisible = () => {
    if (environment.document.visibilityState === "visible" && environment.navigator.onLine) {
      void refresh()
    }
  }

  environment.window.addEventListener("focus", refreshVisible)
  environment.window.addEventListener("online", refreshVisible)
  environment.document.addEventListener("visibilitychange", refreshVisible)
  const interval = environment.window.setInterval(refreshVisible, 60_000)
  void refresh()

  return () => {
    disposed = true
    environment.window.clearInterval(interval)
    environment.window.removeEventListener("focus", refreshVisible)
    environment.window.removeEventListener("online", refreshVisible)
    environment.document.removeEventListener("visibilitychange", refreshVisible)
  }
}
