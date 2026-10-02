import { DEFAULT_PROGRAM_SESSIONS, type ProgramSession } from "./program-data"

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
      onSessions(sessions.length > 0 ? sessions : DEFAULT_PROGRAM_SESSIONS)
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
