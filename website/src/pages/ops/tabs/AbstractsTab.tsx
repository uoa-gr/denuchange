import { useState, useMemo } from "react"
import type { Abstract } from "../lib/types"
import { signFileUrl } from "../lib/ops-api"
import { exportToExcel } from "../lib/excel"

interface Props {
  rows: Abstract[]
}

export function AbstractsTab({ rows }: Props) {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((r) =>
      [r.first_name, r.last_name, r.email, r.affiliation, r.title, r.co_authors]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    )
  }, [rows, q])

  async function download(path: string) {
    try {
      const url = await signFileUrl("abstracts", path)
      window.open(url, "_blank", "noopener")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed")
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
          onClick={() => exportToExcel(filtered, "Abstracts", "abstracts.xlsx")}
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
              <th className="px-2 py-1.5">Author</th>
              <th className="px-2 py-1.5">Email</th>
              <th className="px-2 py-1.5">Affiliation</th>
              <th className="px-2 py-1.5">Title</th>
              <th className="px-2 py-1.5">Co-authors</th>
              <th className="px-2 py-1.5">Type</th>
              <th className="px-2 py-1.5">File</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200">
                <td className="px-2 py-1.5 whitespace-nowrap">{r.created_at.slice(0, 10)}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{r.first_name} {r.last_name}</td>
                <td className="px-2 py-1.5">{r.email}</td>
                <td className="px-2 py-1.5">{r.affiliation}</td>
                <td className="px-2 py-1.5 max-w-[24rem] truncate" title={r.title}>{r.title}</td>
                <td className="px-2 py-1.5 max-w-[16rem] truncate" title={r.co_authors}>{r.co_authors}</td>
                <td className="px-2 py-1.5">{r.presentation_type}</td>
                <td className="px-2 py-1.5">
                  {r.file_path ? (
                    <button
                      onClick={() => download(r.file_path!)}
                      className="text-blue-700 underline cursor-pointer"
                    >
                      Download
                    </button>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
