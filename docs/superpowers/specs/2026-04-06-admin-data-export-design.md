# Hidden Admin Data Export Page — Design Spec

**Date:** 2026-04-06
**Status:** Approved, revised 2026-04-06 after codebase discovery

## Revision Note (2026-04-06)

Post-approval discovery found that the denuchange website already has substantial
infrastructure that the original spec proposed to build from scratch. The plan
reuses this infrastructure instead. Key differences from the sections below:

- **Router:** `react-router-dom` is already wired in `src/main.tsx`. A new
  `<Route path="/OPS_DATA_EXPORT">` is added instead of a path-check in `main.tsx`.
- **Auth:** The existing `api/app/auth.ts` (login/logout/me, bcrypt, `HttpOnly`
  cookie JWT, `app_users.is_admin` flag) is reused verbatim. The new admin page
  gates on the existing cookie + `isAdmin` instead of a new password+JWT system.
  `ADMIN_PASSWORD_HASH` and `ADMIN_JWT_SECRET` env vars are NOT added.
- **Service-role client:** `api/_lib/supabase-admin.ts` already exists and reads
  `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. Reused as-is.
- **Endpoints:** New admin actions are added to the existing consolidated
  `api/app/admin.ts` handler (following its `?action=` pattern), not as new files.
- **Bulk-zip:** Cookie auth is automatic on `<a href>` downloads, so the
  `?token=` query-string workaround is no longer needed.
- **Two-layer security is preserved:** obscure URL for discoverability + existing
  `is_admin` cookie auth for authorization.

Everything below describes the *original intent*; the plan at
`docs/superpowers/plans/2026-04-06-admin-data-export.md` is authoritative for
implementation.

---

## Purpose

Provide organizers with a hidden, password-protected page on the denuchange website to view, export, and download all data collected from the DENUCHANGE 2026 registration system (registrations, abstracts, payment receipts, and the associated uploaded files in private Supabase Storage buckets).

The page is modeled after the existing external reference app at `external/thematic-sessions-export/` but is tailored to this project's Supabase schema and is significantly more secure: the Supabase service-role key never reaches the browser, private file downloads use short-lived signed URLs minted server-side, and all access is gated by a password that unlocks a short-lived JWT session.

## Constraints & Non-Goals

- **Do not touch** `external/thematic-sessions-export/` — it belongs to another project.
- **Do not weaken** the existing Supabase RLS policies. The anon key in the public site must remain minimally privileged.
- **Not a user management system.** One shared password, one role (organizer). No per-user accounts.
- **Not linked** from anywhere on the public site. No navigation entry, no footer link, no sitemap entry. Access is by knowing the URL + the password.
- **No public indexing.** `robots.txt` / meta robots must disallow the slug (belt and suspenders — it should never be discovered anyway).

## Access Model

### Obscure URL
The admin page lives at `/OPS_DATA_EXPORT` on the denuchange website. This is a static, known-to-organizers slug, not baked into any navigation, sitemap, or build-time reference from the public site bundle.

### Password Gate
- Single shared password, known to organizers out-of-band.
- The password's **bcrypt hash** is stored in Vercel env var `ADMIN_PASSWORD_HASH`. The plaintext password is never stored anywhere in the repo or in Vercel.
- Login endpoint accepts the plaintext password, compares against the hash with `bcrypt.compare`, and on success returns a signed JWT.
- Login endpoint is **rate-limited** per IP (simple in-memory sliding window — e.g. 5 attempts per 15 minutes; on exceed returns 429). Acceptable because brute-forcing bcrypt over HTTP is infeasible anyway; the rate limit is belt-and-suspenders.

### Session Token
- JWT signed with `ADMIN_JWT_SECRET` (HS256), payload `{ role: "admin", iat, exp }`, expiry **8 hours**.
- Stored in `sessionStorage` on the client (cleared when the browser tab closes).
- Sent as `Authorization: Bearer <jwt>` on every `/api/admin/*` request except `/login`.
- Every protected endpoint verifies the signature and expiry before doing any work.

### Why this is secure
- `SUPABASE_SERVICE_ROLE_KEY` lives only in Vercel env vars, used only inside serverless functions. It is never shipped to the browser.
- Private bucket files (`abstracts`, `payment-receipts`) are fetched via `createSignedUrl` with a 60-second TTL, minted server-side only after JWT verification.
- The login endpoint is the only unauthenticated admin endpoint, and it is rate-limited.
- Rotating the password = change `ADMIN_PASSWORD_HASH`, redeploy. Rotating the JWT secret = change `ADMIN_JWT_SECRET`, redeploy (invalidates all existing sessions).

## Architecture

```
Browser ──/OPS_DATA_EXPORT──▶  Vite SPA (main.tsx path check)
                                    │
                                    ├─ lazy-loads AdminApp bundle
                                    │
                                    ▼
                               AdminApp React tree
                                    │
                                    │  fetch + Bearer JWT
                                    ▼
                               /api/admin/*  (Vercel Functions)
                                    │
                                    │  service-role key
                                    ▼
                               Supabase (Postgres + Storage)
```

### Frontend: path-based lazy mount

[website/src/main.tsx](website/src/main.tsx) currently mounts `<App/>` unconditionally. Change it to:

```ts
const path = window.location.pathname.replace(/\/$/, "")
if (path === "/OPS_DATA_EXPORT") {
  import("./app/admin/AdminApp").then(({ AdminApp }) => {
    createRoot(document.getElementById("root")!).render(<AdminApp />)
  })
} else {
  createRoot(document.getElementById("root")!).render(<App />)
}
```

Rationale:
- Zero changes to the public `<App/>` tree; main site bundle is unaffected.
- Admin code is in a separate chunk, only downloaded when the slug is hit — the admin JS never lands in the public bundle at all.
- No router dependency added.
- Vercel's SPA rewrite (`vercel.json`) already sends unknown paths to `index.html`, so the slug resolves.

### Frontend: AdminApp structure

New directory `website/src/app/admin/`:

- `AdminApp.tsx` — root. Checks `sessionStorage.adminJwt`; if present + not expired (decoded client-side for UX only — server is source of truth), renders `<AdminDashboard/>`, else `<AdminLogin/>`.
- `AdminLogin.tsx` — single password input, submit button, error display. POSTs to `/api/admin/login`.
- `AdminDashboard.tsx` — header (title, Refresh, Download All ZIP, Logout) + tab switcher + active tab view. On mount, calls `/api/admin/data` once and holds result in state.
- `tabs/RegistrationsTab.tsx` — searchable/sortable table, Export Excel button, "Confirm payment" toggle per row.
- `tabs/AbstractsTab.tsx` — searchable/sortable table, Export Excel button, "Download file" button per row (only when `file_path` is set).
- `tabs/PaymentReceiptsTab.tsx` — searchable/sortable table, Export Excel button, "Download file" button per row.
- `lib/api.ts` — thin fetch wrapper that injects `Authorization: Bearer` from sessionStorage, auto-logs-out on 401.
- `lib/excel.ts` — wraps `xlsx` (SheetJS) to produce a workbook from an array of objects.

Reuse existing shadcn/Tailwind primitives from [website/src/components/ui/](website/src/components/ui/) (`Button`, `Input`, `Table`, `Tabs`, `Card`). The admin page should look consistent with the main site but be unambiguously an operational tool (plain header, monospace-leaning table, no marketing chrome).

### Backend: Vercel serverless functions

All new files under [website/api/admin/](website/api/admin/). Each is a standard Vercel Node function.

Shared helpers in `website/api/admin/_lib/`:

- `auth.ts`
  - `hashPassword(plain)` — utility, used once to generate the env var value (documented in spec, not called at runtime).
  - `verifyPassword(plain, hash)` — bcrypt compare.
  - `signJwt(payload)` — HS256 with `ADMIN_JWT_SECRET`, 8h expiry.
  - `verifyJwt(token)` — returns payload or throws.
  - `requireAuth(req)` — extracts Bearer, verifies, returns payload or throws a typed error that the handler turns into 401.
- `rate-limit.ts` — in-memory sliding-window limiter keyed by IP. Note: Vercel functions are stateless across cold starts, so this is best-effort. Acceptable because bcrypt + JWT already make brute force infeasible; the limiter just stops obvious abuse from hot instances.
- `supabase-admin.ts` — exports a singleton `@supabase/supabase-js` client created with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.

Endpoints:

#### `POST /api/admin/login`
- Body: `{ password: string }`
- Rate-limit check (by `x-forwarded-for`). On exceed: 429.
- `verifyPassword(body.password, env.ADMIN_PASSWORD_HASH)`. On fail: 401, record attempt.
- On success: return `{ token: signJwt({ role: "admin" }) }`.

#### `GET /api/admin/data`
- `requireAuth`.
- Query Supabase for all rows of `registrations`, `abstracts`, `payment_receipts` in parallel (`supabase.from(...).select("*").order("created_at", { ascending: false })`).
- Return `{ registrations, abstracts, payment_receipts }`.

#### `POST /api/admin/file-url`
- `requireAuth`.
- Body: `{ bucket: "abstracts" | "payment-receipts", path: string }`. Validate `bucket` is in the allowlist. Validate `path` is non-empty and does not contain `..`.
- `supabase.storage.from(bucket).createSignedUrl(path, 60)`.
- Return `{ url }`.

#### `POST /api/admin/confirm-payment`
- `requireAuth`.
- Body: `{ registration_id: string (uuid), confirmed: boolean }`.
- `supabase.from("registrations").update({ payment_confirmed: confirmed }).eq("id", registration_id)`.
- Return `{ ok: true }`.

#### `GET /api/admin/bulk-zip`
- `requireAuth` — but since `<a href>` downloads can't set headers, accept the JWT via `?token=` query param for this endpoint only. Verify the same way. Document this exception clearly.
- Create a zip stream with `archiver`:
  - `registrations.csv` — all rows as CSV
  - `abstracts.csv` — all rows as CSV
  - `payment_receipts.csv` — all rows as CSV
  - `abstracts/<original path>` — every file referenced by `abstracts.file_path`, downloaded via `supabase.storage.from("abstracts").download(path)`
  - `payment-receipts/<original path>` — every file in `payment_receipts.file_path`
- Stream with `Content-Type: application/zip` and `Content-Disposition: attachment; filename="denuchange-export-<YYYY-MM-DD>.zip"`.
- If any single file fetch fails, include a `README-errors.txt` in the zip listing the failures rather than aborting the whole download.

## Data Flow Walkthroughs

### First load
1. User opens `https://denuchange.site/OPS_DATA_EXPORT`.
2. Vercel serves `index.html` (SPA rewrite).
3. `main.tsx` sees the slug, dynamically imports `AdminApp`.
4. `AdminApp` sees no JWT → renders `AdminLogin`.

### Login
1. User types password, clicks Login.
2. POST `/api/admin/login` → server verifies bcrypt, signs JWT, returns.
3. Client stores `token` in `sessionStorage.adminJwt`.
4. `AdminApp` re-renders `AdminDashboard`.
5. Dashboard `useEffect` calls `GET /api/admin/data` → populates state.

### Download an abstract file
1. User clicks "Download" on a row whose `file_path` = `"abstracts/alice-et-al.pdf"`.
2. Client POSTs `/api/admin/file-url` with `{ bucket: "abstracts", path: "alice-et-al.pdf" }`.
3. Server verifies JWT, mints 60s signed URL, returns it.
4. Client does `window.open(url, "_blank")`.

### Confirm payment
1. User toggles the switch on a registration row.
2. Client POSTs `/api/admin/confirm-payment` with the id and new value.
3. Server verifies JWT, updates row, returns `{ ok: true }`.
4. Client optimistically updates the local state; on error, reverts + shows toast.

### Bulk ZIP
1. User clicks "Download All (ZIP)" in the header.
2. Client constructs `/api/admin/bulk-zip?token=<jwt>` and sets `window.location.href` to it (browser handles the download).
3. Server streams zip as described above.

## Environment Variables

Add to Vercel project settings (not to any committed file):

| Name | Where | Purpose |
|---|---|---|
| `ADMIN_PASSWORD_HASH` | Vercel (server) | bcrypt hash of the shared password |
| `ADMIN_JWT_SECRET` | Vercel (server) | HS256 signing secret, ≥32 random bytes |
| `SUPABASE_URL` | Vercel (server) | Same URL as `VITE_SUPABASE_URL`, duplicated for server use |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server) | Supabase service role key — **server only, never prefixed with `VITE_`** |

Instructions for generating the hash will live in a short `README` note inside `website/api/admin/_lib/` or in the spec's appendix — run once locally:
```
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'your-password'
```

Generate JWT secret:
```
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Dependencies to Add

In [website/package.json](website/package.json):
- `jsonwebtoken` + `@types/jsonwebtoken`
- `bcryptjs` + `@types/bcryptjs`
- `xlsx` (SheetJS — client-side, for Excel export)
- `archiver` + `@types/archiver` (server-side, for bulk zip)

`@supabase/supabase-js` is presumably already present for the public site; reuse it.

## Error Handling

- All `/api/admin/*` handlers wrap their body in a try/catch that returns `{ error: string }` with an appropriate status (400 validation, 401 auth, 429 rate limit, 500 unexpected).
- Client `lib/api.ts` centralizes error parsing and toasts via the existing sonner/toast UI used by the public forms (if available; otherwise plain inline error banners).
- On 401 from any endpoint, the client clears `sessionStorage.adminJwt` and returns to the login screen.
- The bulk-zip endpoint catches per-file download errors and records them in the zip rather than failing the whole stream.

## Testing Plan

**Manual verification (primary).** Because this is a small ops tool, full automated test coverage is not warranted. Minimum manual checks:

1. Main site (`/`) loads unchanged, bundle size delta for public chunk is ~0 (admin code is a separate chunk).
2. Navigating to `/OPS_DATA_EXPORT` shows the login screen.
3. Wrong password → 401, correct password → dashboard loads.
4. Each tab shows data from Supabase matching what the dashboard shows.
5. Excel export per tab produces a valid `.xlsx` with expected columns.
6. Downloading an abstract file opens the correct PDF/DOCX via a signed URL that expires after 60s.
7. Toggling payment confirmation persists (reload → still confirmed).
8. Bulk ZIP contains all three CSVs + every file from both buckets, or an errors README for any missing.
9. Logout clears the session; refresh returns to login.
10. JWT expiry — manually expire the token (or wait), next API call returns to login.
11. Rate limit — 6 wrong passwords in a row from the same IP returns 429.
12. `SUPABASE_SERVICE_ROLE_KEY` does not appear anywhere in the built client bundle (grep the `dist/` output).

**Automated (lightweight):** One unit test per auth helper (`verifyPassword`, `signJwt`/`verifyJwt` round-trip) if a test runner is already set up in the project. Skip if not.

## File Manifest

New:
- `website/src/app/admin/AdminApp.tsx`
- `website/src/app/admin/AdminLogin.tsx`
- `website/src/app/admin/AdminDashboard.tsx`
- `website/src/app/admin/tabs/RegistrationsTab.tsx`
- `website/src/app/admin/tabs/AbstractsTab.tsx`
- `website/src/app/admin/tabs/PaymentReceiptsTab.tsx`
- `website/src/app/admin/lib/api.ts`
- `website/src/app/admin/lib/excel.ts`
- `website/api/admin/_lib/auth.ts`
- `website/api/admin/_lib/rate-limit.ts`
- `website/api/admin/_lib/supabase-admin.ts`
- `website/api/admin/login.ts`
- `website/api/admin/data.ts`
- `website/api/admin/file-url.ts`
- `website/api/admin/confirm-payment.ts`
- `website/api/admin/bulk-zip.ts`

Modified:
- `website/src/main.tsx` — add path check and lazy admin mount
- `website/package.json` — add deps above
- `website/public/robots.txt` (create if missing) — `Disallow: /OPS_DATA_EXPORT`

Untouched:
- `external/thematic-sessions-export/` — reference only, do not modify
- All existing public-site components
- Supabase schema and RLS policies
