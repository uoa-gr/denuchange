import { useEffect, useState } from "react"
import type { OpsData, Registration } from "./lib/types"
import { fetchOpsData, logout, bulkZipUrl } from "./lib/ops-api"
import { RegistrationsTab } from "./tabs/RegistrationsTab"
import { AbstractsTab } from "./tabs/AbstractsTab"
import { PaymentReceiptsTab } from "./tabs/PaymentReceiptsTab"

type Tab = "registrations" | "abstracts" | "payments"

interface Props {
  onLogout: () => void
}

export function OpsDashboard({ onLogout }: Props) {
  const [data, setData] = useState<OpsData | null>(null)
  const [tab, setTab] = useState<Tab>("registrations")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    setErr(null)
    try {
      setData(await fetchOpsData())
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onLogoutClick() {
    await logout()
    onLogout()
  }

  function updateRegistrations(rows: Registration[]) {
    if (!data) return
    setData({ ...data, registrations: rows })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3">
        <h1 className="text-base font-semibold">Ops Data Export</h1>
        <nav className="flex gap-1 ml-4">
          {(["registrations", "abstracts", "payments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm ${tab === t ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}
            >
              {t === "payments" ? "Payments" : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex gap-2">
          <button onClick={refresh} disabled={loading} className="text-sm px-3 py-1.5 border border-neutral-300">
            {loading ? "Loading…" : "Refresh"}
          </button>
          <a href={bulkZipUrl()} className="text-sm px-3 py-1.5 bg-blue-700 text-white">
            Download All (ZIP)
          </a>
          <button onClick={onLogoutClick} className="text-sm px-3 py-1.5 border border-neutral-300">
            Logout
          </button>
        </div>
      </header>

      <main className="p-4">
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
        {!data ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : tab === "registrations" ? (
          <RegistrationsTab rows={data.registrations} onUpdate={updateRegistrations} />
        ) : tab === "abstracts" ? (
          <AbstractsTab rows={data.abstracts} />
        ) : (
          <PaymentReceiptsTab rows={data.payment_receipts} />
        )}
      </main>
    </div>
  )
}
