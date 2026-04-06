import { useState, useMemo } from "react"
import type { Registration } from "../lib/types"
import { confirmPayment } from "../lib/ops-api"
import { exportToExcel } from "../lib/excel"

interface Props {
  rows: Registration[]
  onUpdate: (rows: Registration[]) => void
}

export function RegistrationsTab({ rows, onUpdate }: Props) {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((r) =>
      [r.first_name, r.last_name, r.email, r.affiliation, r.country, r.registration_type]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    )
  }, [rows, q])

  async function toggle(id: string, next: boolean) {
    const prev = rows
    onUpdate(rows.map((r) => (r.id === id ? { ...r, payment_confirmed: next } : r)))
    try {
      await confirmPayment(id, next)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed")
      onUpdate(prev)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="border border-neutral-300 px-3 py-1.5 text-sm w-64"
        />
        <span className="text-xs text-neutral-500">{filtered.length} / {rows.length}</span>
        <button
          onClick={() => exportToExcel(filtered, "Registrations", "registrations.xlsx")}
          className="ml-auto bg-neutral-900 text-white text-sm px-3 py-1.5 cursor-pointer"
        >
          Export Excel
        </button>
      </div>
      <div className="overflow-auto border border-neutral-200">
        <table className="min-w-full text-xs">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-2 py-1.5">Created</th>
              <th className="px-2 py-1.5">Name</th>
              <th className="px-2 py-1.5">Email</th>
              <th className="px-2 py-1.5">Affiliation</th>
              <th className="px-2 py-1.5">Country</th>
              <th className="px-2 py-1.5">Type</th>
              <th className="px-2 py-1.5">Abstract</th>
              <th className="px-2 py-1.5">Dietary</th>
              <th className="px-2 py-1.5">Paid</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200">
                <td className="px-2 py-1.5 whitespace-nowrap">{r.created_at.slice(0, 10)}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{r.first_name} {r.last_name}</td>
                <td className="px-2 py-1.5">{r.email}</td>
                <td className="px-2 py-1.5">{r.affiliation}</td>
                <td className="px-2 py-1.5">{r.country}</td>
                <td className="px-2 py-1.5">{r.registration_type}</td>
                <td className="px-2 py-1.5">{r.abstract_intent}</td>
                <td className="px-2 py-1.5">{r.dietary === "other" ? r.dietary_other : r.dietary}</td>
                <td className="px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={r.payment_confirmed}
                    onChange={(e) => toggle(r.id, e.target.checked)}
                    className="cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
