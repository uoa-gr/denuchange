# Hidden Admin Data Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hidden `/OPS_DATA_EXPORT` page to the denuchange website that lets organizers view, export (Excel), download files from, and bulk-zip all data in the Supabase project — gated by both an obscure URL and the existing `app_users.is_admin` cookie session.

**Architecture:** Reuse the existing `react-router-dom`, `api/app/auth.ts` (cookie-JWT), `api/_lib/supabase-admin.ts` (service-role client), and the `?action=` consolidated handler pattern from `api/app/admin.ts`. Add new admin `?action=` endpoints for data fetch, signed file URLs, payment confirmation, and bulk zip. Add a new top-level route rendering a standalone admin page not linked from any navigation.

**Tech Stack:** React 19 + react-router-dom 7, Vite, Tailwind + shadcn/ui, Vercel serverless functions (Node), `@supabase/supabase-js` (service role), `xlsx` (SheetJS), `archiver`.

**Reference files (read before starting):**
- [website/src/main.tsx](website/src/main.tsx) — router mount
- [website/api/app/admin.ts](website/api/app/admin.ts) — existing admin handler pattern
- [website/api/app/auth.ts](website/api/app/auth.ts) — existing login/logout
- [website/api/_lib/auth.ts](website/api/_lib/auth.ts) — `extractJwt`, `signJwt`, cookie helpers
- [website/api/_lib/supabase-admin.ts](website/api/_lib/supabase-admin.ts) — service-role client
- [website/supabase-schema.sql](supabase-schema.sql) — data model
- [website/src/components/ui/](website/src/components/ui/) — shadcn primitives to reuse

---

## File Structure

**New files:**
- `website/src/pages/ops/OpsExportPage.tsx` — entry page; renders `<OpsLogin>` or `<OpsDashboard>` based on session
- `website/src/pages/ops/OpsLogin.tsx` — email + password form, hits existing `/api/app/auth?action=login`
- `website/src/pages/ops/OpsDashboard.tsx` — header + tab switcher + "Download All" + "Logout"
- `website/src/pages/ops/tabs/RegistrationsTab.tsx`
- `website/src/pages/ops/tabs/AbstractsTab.tsx`
- `website/src/pages/ops/tabs/PaymentReceiptsTab.tsx`
- `website/src/pages/ops/lib/ops-api.ts` — thin fetch wrapper (credentials: include) + helpers
- `website/src/pages/ops/lib/excel.ts` — `xlsx` wrapper
- `website/src/pages/ops/lib/types.ts` — `Registration`, `Abstract`, `PaymentReceipt` types

**Modified files:**
- `website/src/main.tsx` — add `<Route path="/OPS_DATA_EXPORT" element={<OpsExportPage />} />` before the `App` catch-all
- `website/api/app/admin.ts` — add `ops-data`, `ops-file-url`, `ops-confirm-payment`, `ops-bulk-zip` actions
- `website/package.json` — add `xlsx`, `archiver`, `@types/archiver`
- `website/public/robots.txt` — create if missing, disallow the slug

**Untouched:** `external/`, Supabase schema, existing public components, existing attendee app routes.

---

## Prerequisites (one-time, manual)

- [ ] **Confirm an admin user exists.** In the Supabase SQL editor, run:

```sql
SELECT email, is_admin FROM public.app_users WHERE is_admin = true;
```

If no rows returned, pick the organizer's email (must already be in `registrations`) and run:

```sql
-- Replace with the real email
INSERT INTO public.app_users (email, is_admin)
VALUES ('organizer@example.com', true)
ON CONFLICT (email) DO UPDATE SET is_admin = true;
```

Then have that organizer complete the existing "Set password" flow at `/app/auth/email` if they haven't already. This password is what they will use to log into `/OPS_DATA_EXPORT`.

- [ ] **Verify Vercel env vars already set:** `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`. These are already required by the existing attendee app auth; if the attendee app works, these are set.

---

## Task 1: Add dependencies and robots.txt

**Files:**
- Modify: `website/package.json`
- Create: `website/public/robots.txt`

- [ ] **Step 1: Install new deps**

Run from `website/`:
```bash
npm install xlsx archiver
npm install -D @types/archiver
```

- [ ] **Step 2: Verify `xlsx` and `archiver` appear in `dependencies` and `@types/archiver` in `devDependencies` in `website/package.json`.**

- [ ] **Step 3: Create `website/public/robots.txt`** (overwrite if it exists):

```
User-agent: *
Disallow: /OPS_DATA_EXPORT
```

- [ ] **Step 4: Commit**

```bash
git add website/package.json website/package-lock.json website/public/robots.txt
git commit -m "feat(ops-export): add xlsx/archiver deps and robots.txt disallow"
```

---

## Task 2: Add backend action `ops-data` (fetch all rows)

**Files:**
- Modify: `website/api/app/admin.ts`

- [ ] **Step 1: Add a new action block** inside `_handle` in `website/api/app/admin.ts`, directly after the existing `delete-session` block and before the final `return res.status(404)`:

```ts
  if (req.method === "GET" && action === "ops-data") {
    const sb = getSupabaseAdmin()
    const [regs, abs, pays] = await Promise.all([
      sb.from("registrations").select("*").order("created_at", { ascending: false }),
      sb.from("abstracts").select("*").order("created_at", { ascending: false }),
      sb.from("payment_receipts").select("*").order("created_at", { ascending: false }),
    ])
    if (regs.error || abs.error || pays.error) {
      console.error("ops-data:", regs.error ?? abs.error ?? pays.error)
      return res.status(500).json({ error: "Failed to fetch data" })
    }
    return res.json({
      registrations: regs.data ?? [],
      abstracts: abs.data ?? [],
      payment_receipts: pays.data ?? [],
    })
  }
```

- [ ] **Step 2: Manual sanity** — confirm that the existing `extractJwt` + `isAdmin` gate at the top of `_handle` already protects the new action (it does — gate runs before action dispatch).

- [ ] **Step 3: Build check**

Run from `website/`:
```bash
npm run build
```
Expected: build succeeds with no TS errors.

- [ ] **Step 4: Commit**

```bash
git add website/api/app/admin.ts
git commit -m "feat(ops-export): add ops-data action to fetch all tables"
```

---

## Task 3: Add backend action `ops-file-url` (signed URL)

**Files:**
- Modify: `website/api/app/admin.ts`

- [ ] **Step 1: Add action** below the `ops-data` block:

```ts
  if (req.method === "POST" && action === "ops-file-url") {
    const bucket: string = (req.body?.bucket ?? "").toString()
    const path: string = (req.body?.path ?? "").toString()
    const ALLOWED = new Set(["abstracts", "payment-receipts"])
    if (!ALLOWED.has(bucket)) return res.status(400).json({ error: "Invalid bucket" })
    if (!path || path.includes("..")) return res.status(400).json({ error: "Invalid path" })

    const { data, error } = await getSupabaseAdmin()
      .storage.from(bucket)
      .createSignedUrl(path, 60)
    if (error || !data) {
      console.error("ops-file-url:", error)
      return res.status(500).json({ error: "Failed to sign URL" })
    }
    return res.json({ url: data.signedUrl })
  }
```

- [ ] **Step 2: Build check**

```bash
cd website && npm run build
```
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add website/api/app/admin.ts
git commit -m "feat(ops-export): add ops-file-url action for signed downloads"
```

---

## Task 4: Add backend action `ops-confirm-payment`

**Files:**
- Modify: `website/api/app/admin.ts`

- [ ] **Step 1: Add action** below `ops-file-url`:

```ts
  if (req.method === "POST" && action === "ops-confirm-payment") {
    const id: string = (req.body?.registration_id ?? "").toString()
    const confirmed: boolean = req.body?.confirmed === true
    if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(400).json({ error: "Invalid id" })
    const { error } = await getSupabaseAdmin()
      .from("registrations")
      .update({ payment_confirmed: confirmed })
      .eq("id", id)
    if (error) {
      console.error("ops-confirm-payment:", error)
      return res.status(500).json({ error: "Failed to update" })
    }
    return res.json({ ok: true })
  }
```

- [ ] **Step 2: Build check**

```bash
cd website && npm run build
```
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add website/api/app/admin.ts
git commit -m "feat(ops-export): add ops-confirm-payment action"
```

---

## Task 5: Add backend action `ops-bulk-zip`

**Files:**
- Modify: `website/api/app/admin.ts`

- [ ] **Step 1: Add imports at the top of `website/api/app/admin.ts`** (after the existing imports):

```ts
import archiver from "archiver"
```

- [ ] **Step 2: Add a helper** above the default `handler` export:

```ts
function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return ""
    const s = typeof v === "string" ? v : JSON.stringify(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(",")]
  for (const r of rows) lines.push(headers.map(h => esc(r[h])).join(","))
  return lines.join("\n")
}
```

- [ ] **Step 3: Add the bulk-zip action** below `ops-confirm-payment`:

```ts
  if (req.method === "GET" && action === "ops-bulk-zip") {
    const sb = getSupabaseAdmin()
    const [regs, abs, pays] = await Promise.all([
      sb.from("registrations").select("*").order("created_at", { ascending: false }),
      sb.from("abstracts").select("*").order("created_at", { ascending: false }),
      sb.from("payment_receipts").select("*").order("created_at", { ascending: false }),
    ])
    if (regs.error || abs.error || pays.error) {
      return res.status(500).json({ error: "Failed to fetch data" })
    }

    const today = new Date().toISOString().slice(0, 10)
    res.setHeader("Content-Type", "application/zip")
    res.setHeader("Content-Disposition", `attachment; filename="denuchange-export-${today}.zip"`)

    const archive = archiver("zip", { zlib: { level: 9 } })
    archive.on("error", (err: Error) => {
      console.error("archive error:", err)
      try { res.status(500).end() } catch { /* stream already started */ }
    })
    archive.pipe(res)

    archive.append(rowsToCsv(regs.data ?? []), { name: "registrations.csv" })
    archive.append(rowsToCsv(abs.data ?? []), { name: "abstracts.csv" })
    archive.append(rowsToCsv(pays.data ?? []), { name: "payment_receipts.csv" })

    const errors: string[] = []

    const pullFile = async (bucket: string, path: string, zipPath: string) => {
      try {
        const { data, error } = await sb.storage.from(bucket).download(path)
        if (error || !data) throw error ?? new Error("no data")
        const buf = Buffer.from(await data.arrayBuffer())
        archive.append(buf, { name: zipPath })
      } catch (e) {
        errors.push(`${bucket}/${path}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    for (const row of abs.data ?? []) {
      const p = (row as { file_path?: string }).file_path
      if (p) await pullFile("abstracts", p, `abstracts/${p}`)
    }
    for (const row of pays.data ?? []) {
      const p = (row as { file_path?: string }).file_path
      if (p) await pullFile("payment-receipts", p, `payment-receipts/${p}`)
    }

    if (errors.length > 0) {
      archive.append(errors.join("\n"), { name: "README-errors.txt" })
    }

    await archive.finalize()
    return
  }
```

- [ ] **Step 4: Build check**

```bash
cd website && npm run build
```
Expected: success. If TS complains about `archiver` types, ensure `@types/archiver` is in devDependencies (from Task 1).

- [ ] **Step 5: Commit**

```bash
git add website/api/app/admin.ts
git commit -m "feat(ops-export): add ops-bulk-zip action with CSVs and files"
```

---

## Task 6: Frontend — types and API client

**Files:**
- Create: `website/src/pages/ops/lib/types.ts`
- Create: `website/src/pages/ops/lib/ops-api.ts`

- [ ] **Step 1: Create `website/src/pages/ops/lib/types.ts`**:

```ts
export interface Registration {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  affiliation: string
  country: string
  registration_type: string
  abstract_intent: string
  dietary: string
  dietary_other: string | null
  special_requirements: string
  payment_confirmed: boolean
}

export interface Abstract {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  affiliation: string
  title: string
  co_authors: string
  abstract_text: string | null
  file_path: string | null
  presentation_type: "oral" | "poster"
}

export interface PaymentReceipt {
  id: string
  created_at: string
  email: string
  file_path: string
  notes: string
}

export interface OpsData {
  registrations: Registration[]
  abstracts: Abstract[]
  payment_receipts: PaymentReceipt[]
}
```

- [ ] **Step 2: Create `website/src/pages/ops/lib/ops-api.ts`**:

```ts
import type { OpsData } from "./types"

const BASE = "/api/app/admin"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchMe(): Promise<{ email: string; isAdmin: boolean } | null> {
  const res = await fetch("/api/app/auth?action=me", { credentials: "include" })
  if (!res.ok) return null
  return res.json()
}

export async function login(email: string, password: string): Promise<{ isAdmin: boolean }> {
  return request("/api/app/auth?action=login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function logout(): Promise<void> {
  await fetch("/api/app/auth?action=logout", { method: "POST", credentials: "include" })
}

export async function fetchOpsData(): Promise<OpsData> {
  return request(`${BASE}?action=ops-data`, { method: "GET" })
}

export async function signFileUrl(bucket: "abstracts" | "payment-receipts", path: string): Promise<string> {
  const { url } = await request<{ url: string }>(`${BASE}?action=ops-file-url`, {
    method: "POST",
    body: JSON.stringify({ bucket, path }),
  })
  return url
}

export async function confirmPayment(registration_id: string, confirmed: boolean): Promise<void> {
  await request(`${BASE}?action=ops-confirm-payment`, {
    method: "POST",
    body: JSON.stringify({ registration_id, confirmed }),
  })
}

export function bulkZipUrl(): string {
  return `${BASE}?action=ops-bulk-zip`
}
```

- [ ] **Step 3: Build check**

```bash
cd website && npm run build
```
Expected: success (these files are not imported yet but should type-check).

- [ ] **Step 4: Commit**

```bash
git add website/src/pages/ops/lib
git commit -m "feat(ops-export): add types and API client for ops page"
```

---

## Task 7: Frontend — Excel helper

**Files:**
- Create: `website/src/pages/ops/lib/excel.ts`

- [ ] **Step 1: Create `website/src/pages/ops/lib/excel.ts`**:

```ts
import * as XLSX from "xlsx"

export function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  sheetName: string,
  fileName: string,
): void {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))
  XLSX.writeFile(wb, fileName)
}
```

- [ ] **Step 2: Build check**

```bash
cd website && npm run build
```
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/ops/lib/excel.ts
git commit -m "feat(ops-export): add xlsx export helper"
```

---

## Task 8: Frontend — Login component

**Files:**
- Create: `website/src/pages/ops/OpsLogin.tsx`

- [ ] **Step 1: Create the file**:

```tsx
import { useState, FormEvent } from "react"
import { login } from "./lib/ops-api"

interface Props {
  onSuccess: () => void
}

export function OpsLogin({ onSuccess }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      const res = await login(email, password)
      if (!res.isAdmin) {
        setErr("This account is not an admin.")
        return
      }
      onSuccess()
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-neutral-200 p-6 space-y-4">
        <h1 className="text-lg font-semibold">Ops Data Export</h1>
        <p className="text-xs text-neutral-500">Authorized personnel only.</p>
        <label className="block text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-neutral-900 text-white py-2 text-sm disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/pages/ops/OpsLogin.tsx
git commit -m "feat(ops-export): add OpsLogin component"
```

---

## Task 9: Frontend — Registrations tab

**Files:**
- Create: `website/src/pages/ops/tabs/RegistrationsTab.tsx`

- [ ] **Step 1: Create**:

```tsx
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
          className="ml-auto bg-neutral-900 text-white text-sm px-3 py-1.5"
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
```

- [ ] **Step 2: Commit**

```bash
git add website/src/pages/ops/tabs/RegistrationsTab.tsx
git commit -m "feat(ops-export): add RegistrationsTab"
```

---

## Task 10: Frontend — Abstracts tab

**Files:**
- Create: `website/src/pages/ops/tabs/AbstractsTab.tsx`

- [ ] **Step 1: Create**:

```tsx
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
          className="ml-auto bg-neutral-900 text-white text-sm px-3 py-1.5"
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
                      className="text-blue-700 underline"
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
```

- [ ] **Step 2: Commit**

```bash
git add website/src/pages/ops/tabs/AbstractsTab.tsx
git commit -m "feat(ops-export): add AbstractsTab"
```

---

## Task 11: Frontend — Payment receipts tab

**Files:**
- Create: `website/src/pages/ops/tabs/PaymentReceiptsTab.tsx`

- [ ] **Step 1: Create**:

```tsx
import { useState, useMemo } from "react"
import type { PaymentReceipt } from "../lib/types"
import { signFileUrl } from "../lib/ops-api"
import { exportToExcel } from "../lib/excel"

interface Props {
  rows: PaymentReceipt[]
}

export function PaymentReceiptsTab({ rows }: Props) {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((r) => [r.email, r.notes].join(" ").toLowerCase().includes(needle))
  }, [rows, q])

  async function download(path: string) {
    try {
      const url = await signFileUrl("payment-receipts", path)
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
          onClick={() => exportToExcel(filtered, "PaymentReceipts", "payment-receipts.xlsx")}
          className="ml-auto bg-neutral-900 text-white text-sm px-3 py-1.5"
        >
          Export Excel
        </button>
      </div>
      <div className="overflow-auto border border-neutral-200">
        <table className="min-w-full text-xs">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-2 py-1.5">Created</th>
              <th className="px-2 py-1.5">Email</th>
              <th className="px-2 py-1.5">Notes</th>
              <th className="px-2 py-1.5">File</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200">
                <td className="px-2 py-1.5 whitespace-nowrap">{r.created_at.slice(0, 10)}</td>
                <td className="px-2 py-1.5">{r.email}</td>
                <td className="px-2 py-1.5 max-w-[24rem] truncate" title={r.notes}>{r.notes}</td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => download(r.file_path)}
                    className="text-blue-700 underline"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/pages/ops/tabs/PaymentReceiptsTab.tsx
git commit -m "feat(ops-export): add PaymentReceiptsTab"
```

---

## Task 12: Frontend — Dashboard

**Files:**
- Create: `website/src/pages/ops/OpsDashboard.tsx`

- [ ] **Step 1: Create**:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add website/src/pages/ops/OpsDashboard.tsx
git commit -m "feat(ops-export): add OpsDashboard shell"
```

---

## Task 13: Frontend — Entry page

**Files:**
- Create: `website/src/pages/ops/OpsExportPage.tsx`

- [ ] **Step 1: Create**:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add website/src/pages/ops/OpsExportPage.tsx
git commit -m "feat(ops-export): add OpsExportPage entry"
```

---

## Task 14: Wire the route into `main.tsx`

**Files:**
- Modify: `website/src/main.tsx`

- [ ] **Step 1: Edit `website/src/main.tsx`** to add the ops route. The file currently is:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppRouter } from './app/router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/app/*" element={<AppRouter />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
```

Change it to:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppRouter } from './app/router.tsx'
import { OpsExportPage } from './pages/ops/OpsExportPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/OPS_DATA_EXPORT" element={<OpsExportPage />} />
        <Route path="/app/*" element={<AppRouter />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Build check**

```bash
cd website && npm run build
```
Expected: build succeeds, no TS errors.

- [ ] **Step 3: Commit**

```bash
git add website/src/main.tsx
git commit -m "feat(ops-export): wire /OPS_DATA_EXPORT route"
```

---

## Task 15: Manual verification

- [ ] **Step 1: Dev-run locally** — `cd website && npm run dev`. Because the API endpoints are Vercel functions, use `vercel dev` instead if available, or deploy to a preview.

- [ ] **Step 2: Verify public site unchanged** — open `http://localhost:<port>/`, confirm homepage renders as before, no console errors, no mention of `OPS_DATA_EXPORT` anywhere in page source. Run `grep -r "OPS_DATA_EXPORT" website/dist/` after a build → it should only appear inside JS chunks, not in any visible HTML/meta/sitemap.

- [ ] **Step 3: Verify attendee app unchanged** — `/app/auth/email` still works.

- [ ] **Step 4: Navigate to `/OPS_DATA_EXPORT`** — login screen appears.

- [ ] **Step 5: Wrong credentials** — error shows, no session.

- [ ] **Step 6: Non-admin user login** — use any non-admin `app_users` account → "This account is not an admin." shown.

- [ ] **Step 7: Admin login** — dashboard loads, all three tabs populate with real Supabase data.

- [ ] **Step 8: Search + Excel export** on each tab → xlsx file downloads with correct columns.

- [ ] **Step 9: Abstract download** — click Download on a row with a file → new tab opens the PDF/DOCX via signed URL. Copy the URL, wait 70s, reload it → should 403.

- [ ] **Step 10: Payment receipt download** — same check for `payment-receipts` bucket.

- [ ] **Step 11: Toggle payment confirmed** on a registration → reload the page → state persists.

- [ ] **Step 12: Download All ZIP** → open the archive → contains `registrations.csv`, `abstracts.csv`, `payment_receipts.csv`, `abstracts/...` files, `payment-receipts/...` files, and `README-errors.txt` only if there were failures.

- [ ] **Step 13: Logout** → returns to login screen.

- [ ] **Step 14: Bundle leak check** —

```bash
cd website && npm run build
grep -r "SUPABASE_SERVICE_ROLE_KEY" dist/ || echo "OK: service role key not in client bundle"
grep -r "service_role" dist/ || echo "OK"
```
Expected: "OK" messages. Service role key must NOT appear in any client chunk.

- [ ] **Step 15: robots.txt** — `curl http://localhost:<port>/robots.txt` → shows the Disallow line.

---

## Self-Review Checklist

**Spec coverage:**
- Obscure URL `/OPS_DATA_EXPORT` → Task 14 ✓
- Password gate → Task 8 (reuses existing auth per revision note) ✓
- Service-role key stays server-side → Tasks 2–5 (reuses existing `getSupabaseAdmin`), verified Task 15 Step 14 ✓
- View registrations/abstracts/payments → Tasks 9–12 ✓
- Excel export per tab → Task 7 + Tasks 9–11 ✓
- Download private files via signed URLs → Tasks 3, 10, 11 ✓
- Confirm payment toggle → Tasks 4, 9 ✓
- Bulk ZIP of tables + files → Task 5 + Task 12 link ✓
- Not linked from public site → Task 14 (no nav entry), Task 1 (robots.txt) ✓
- 60s signed URL TTL → Task 3 ✓
- Admin-only gate on every endpoint → Tasks 2–5 (all pass through existing `isAdmin` gate at top of `_handle`) ✓

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:** `Registration`, `Abstract`, `PaymentReceipt`, `OpsData` defined in Task 6 and used consistently in Tasks 9–13. API endpoints `ops-data`, `ops-file-url`, `ops-confirm-payment`, `ops-bulk-zip` named consistently across backend (Tasks 2–5) and client (`ops-api.ts` in Task 6).

**Scope:** Single feature, single plan, ~15 bite-sized tasks.
