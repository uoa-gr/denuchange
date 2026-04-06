import { useEffect, useState } from "react"
import { OpsLogin } from "./OpsLogin"
import { OpsDashboard } from "./OpsDashboard"
import { fetchMe } from "./lib/ops-api"

type State = "checking" | "login" | "authed"

export function OpsExportPage() {
  const [state, setState] = useState<State>("checking")

  useEffect(() => {
    fetchMe().then((me) => {
      setState(me && me.isAdmin ? "authed" : "login")
    })
  }, [])

  if (state === "checking") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">Checking session…</div>
  }
  if (state === "login") {
    return <OpsLogin onSuccess={() => setState("authed")} />
  }
  return <OpsDashboard onLogout={() => setState("login")} />
}
