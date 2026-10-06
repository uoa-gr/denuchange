import assert from "node:assert/strict"
import test from "node:test"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createServer } from "vite"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ministryEmails = ["ch.koromilas@prv.ypeka.gr", "mpouzasd@prv.ypeka.gr"]
const guestEmails = [...ministryEmails, "apittaras@icloud.com", "operations@lagunacoastresort.com", "office@lagunacoast.org", "kkefalea@gmail.com", "noamgr@geo.haifa.ac.il"]
const jwtSecret = "local-passwordless-auth-regression-test-secret"

// The real auth handlers, JWT library and Supabase client talk to a local REST
// fixture. No production database, mail server or authenticated user is used.
async function fixture(context, { requireRegistration = false } = {}) {
  const tables = { registrations: [], app_users: [], password_setup_tokens: [], notifications: [] }
  const writes = []
  let failTable = null
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost")
    const table = url.pathname.split("/").at(-1)
    res.setHeader("Content-Type", "application/json")
    if (!Object.hasOwn(tables, table) || table === failTable) {
      res.writeHead(500)
      res.end(JSON.stringify({ message: "Local fixture database unavailable", code: "XX000" }))
      return
    }
    const matches = row => [...url.searchParams].every(([key, value]) => {
      if (key === "email" && value.startsWith("ilike.")) return row.email.toLowerCase() === value.slice(6).toLowerCase()
      if (key === "email" && value.startsWith("eq.")) return row.email === value.slice(3)
      return true
    })
    if (req.method === "GET") {
      const fields = url.searchParams.get("select")?.split(",")
      const rows = tables[table].filter(matches).map(row => fields ? Object.fromEntries(fields.map(field => [field, row[field] ?? null])) : row)
      res.end(JSON.stringify(rows))
      return
    }
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks).toString())
    if (requireRegistration && table === "app_users" && req.method === "POST" && !tables.registrations.some(row => row.email === body.email)) {
      res.writeHead(409)
      res.end(JSON.stringify({ message: "app_users email references registrations", code: "23503" }))
      return
    }
    writes.push({ table, method: req.method, body, prefer: req.headers.prefer ?? "" })
    if (req.method === "POST") {
      for (const record of Array.isArray(body) ? body : [body]) {
        const existing = tables[table].find(row => row.email === record.email)
        if (existing && !req.headers.prefer?.includes("resolution=ignore-duplicates")) Object.assign(existing, record)
        else if (!existing) tables[table].push({ ...(table === "registrations" ? { payment_confirmed: false } : {}), ...record })
      }
    } else if (req.method === "PATCH") {
      tables[table].filter(matches).forEach(row => Object.assign(row, body))
    }
    res.writeHead(204)
    res.end()
  })
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
  const oldEnv = Object.fromEntries(["JWT_SECRET", "VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].map(key => [key, process.env[key]]))
  process.env.JWT_SECRET = jwtSecret
  process.env.VITE_SUPABASE_URL = `http://127.0.0.1:${server.address().port}`
  process.env.SUPABASE_SERVICE_ROLE_KEY = "local-test-only-service-key"
  const vite = await createServer({ root: projectRoot, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: "custom" })
  context.after(async () => {
    await vite.close()
    await new Promise(resolve => server.close(resolve))
    for (const [key, value] of Object.entries(oldEnv)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
  const auth = (await vite.ssrLoadModule("/api/app/auth.ts")).default
  const admin = (await vite.ssrLoadModule("/api/app/admin.ts")).default
  return { tables, writes, auth, admin, vite, fail: table => { failTable = table } }
}

async function call(handler, action, body = {}, cookie = "", method = "POST") {
  const response = {
    code: 200, headers: {}, headersSent: false, body: null,
    status(code) { this.code = code; return this },
    setHeader(name, value) { this.headers[name] = value },
    json(value) { this.body = value; this.headersSent = true; return this },
  }
  await handler({ method, query: { action }, body, headers: { cookie } }, response)
  return response
}

function sessionCookie(email, isAdmin = false) {
  return `denuchange_session=${jwt.sign({ email, isAdmin }, jwtSecret, { expiresIn: "7d" })}`
}

test("allowlisted email entry signs in without a password and preserves existing registration/profile data", async context => {
  const f = await fixture(context)
  const email = ministryEmails[0]
  const registration = { email, first_name: "Existing", last_name: "Participant", affiliation: "Existing affiliation", country: "Greece", registration_type: "meeting_only", payment_confirmed: false, dietary: "vegetarian" }
  const passwordHash = await bcrypt.hash("existing-password", 4)
  f.tables.registrations.push({ ...registration })
  f.tables.app_users.push({ email, is_admin: true, password_hash: passwordHash, avatar_path: "existing-avatar.jpg" })
  const response = await call(f.auth, "check", { email: `  ${email.toUpperCase()}  ` })
  assert.equal(response.code, 200)
  assert.equal(response.body.status, "authenticated")
  assert.equal(response.body.user.email, email)
  assert.equal(response.body.user.isAdmin, false)
  const token = response.headers["Set-Cookie"].split(";")[0].split("=")[1]
  assert.equal(jwt.verify(token, jwtSecret).isAdmin, false)
  assert.deepEqual(f.tables.registrations, [registration], "Signing in must not alter registration or payment records")
  assert.deepEqual(f.tables.app_users, [{ email, is_admin: false, password_hash: passwordHash, avatar_path: "existing-avatar.jpg" }])
  assert.ok(f.writes.every(write => write.body.email === email || (write.table === "app_users" && write.method === "PATCH")), "Only the signed-in guest is synchronized")
})

test("all approved guest addresses enter from email alone and get non-admin sessions", async context => {
  const f = await fixture(context)
  for (const email of guestEmails) {
    const entry = await call(f.auth, "check", { email })
    assert.equal(entry.code, 200)
    assert.equal(entry.body.status, "authenticated")
    assert.equal(entry.body.user.isAdmin, false)
    const response = await call(f.auth, "login", { email })
    assert.equal(response.code, 200)
    assert.equal(response.body.email, email)
    assert.equal(response.body.isAdmin, false)
    const cookie = response.headers["Set-Cookie"].split(";")[0]
    assert.equal((await call(f.auth, "me", {}, cookie, "GET")).body.isAdmin, false)
  }
  assert.ok(f.tables.registrations.every(row => row.payment_confirmed === false))
  assert.deepEqual(f.tables.registrations.map(row => row.email).sort(), [...ministryEmails].sort(), "Guests without known registration details must not be assigned a financial registration")
  assert.equal(f.tables.app_users.length, 2)
  assert.ok(f.tables.app_users.every(row => row.is_admin === false))
})

test("approved guests without financial registrations can enter when app profiles require a registration", async context => {
  const f = await fixture(context, { requireRegistration: true })
  context.mock.method(console, "error", () => {})
  for (const [email, firstName, lastName] of [["apittaras@icloud.com", "Antonis", "Pittaras"], ["operations@lagunacoastresort.com", "Eleni", "Alachmaneti"]]) {
    const response = await call(f.auth, "check", { email })
    assert.equal(response.code, 200)
    assert.equal(response.body.status, "authenticated")
    assert.equal(response.body.user.isAdmin, false)
    const cookie = response.headers["Set-Cookie"].split(";")[0]
    const profile = await call(f.auth, "me", {}, cookie, "GET")
    assert.equal(profile.code, 200)
    assert.equal(profile.body.firstName, firstName)
    assert.equal(profile.body.lastName, lastName)
    assert.equal(profile.body.isAdmin, false)
    assert.equal((await call(f.admin, "notify", { title: "Unauthorized", body: "Must not be posted" }, sessionCookie(email, true))).code, 403)
  }
  assert.deepEqual(f.tables.registrations, [], "App access does not invent a workshop registration")
  assert.deepEqual(f.tables.app_users, [], "A registration-dependent profile is unnecessary for guest program and alerts access")
})

test("guest me and admin routes ignore admin privileges in old cookies and stored profiles", async context => {
  const f = await fixture(context)
  for (const email of guestEmails) {
    f.tables.app_users.push({ email, is_admin: true, avatar_path: "avatar.jpg" })
    const cookie = sessionCookie(email.toUpperCase(), true)
    const response = await call(f.auth, "me", {}, cookie, "GET")
    assert.equal(response.code, 200)
    assert.equal(response.body.isAdmin, false)
    const blocked = await call(f.admin, "notify", { title: "Unauthorized", body: "Must not be posted" }, cookie)
    assert.equal(blocked.code, 403)
  }
  assert.equal(f.tables.notifications.length, 0)
})

test("passwordless access is limited to the exact approved addresses", async context => {
  const f = await fixture(context)
  const { PASSWORDLESS_USERS } = await f.vite.ssrLoadModule("/api/_lib/passwordless-users.ts")
  assert.deepEqual(Object.keys(PASSWORDLESS_USERS).sort(), [...guestEmails].sort())
  for (const email of ["pittaras@icloud.com", "apittaras+guest@icloud.com", "eleni@lagunacoastresort.com", "operations@example.test"]) {
    const response = await call(f.auth, "check", { email })
    assert.equal(response.body.status, "not_registered")
    assert.equal(response.headers["Set-Cookie"], undefined)
  }
})

test("inherited object property names never grant passwordless access or a session", async context => {
  const f = await fixture(context)
  for (const email of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
    const response = await call(f.auth, "login", { email })
    assert.equal(response.code, 400)
    assert.equal(response.headers["Set-Cookie"], undefined)
  }
  assert.deepEqual(f.tables.app_users, [])
})

test("ordinary attendee and admin password authentication is unchanged", async context => {
  const f = await fixture(context)
  const passwordHash = await bcrypt.hash("ordinary-password", 4)
  for (const [email, isAdmin] of [["attendee@example.test", false], ["admin@example.test", true]]) {
    f.tables.registrations.push({ email, first_name: "Existing", last_name: "User", affiliation: "University", registration_type: "regular_full" })
    f.tables.app_users.push({ email, is_admin: isAdmin, password_hash: passwordHash, avatar_path: null })
    assert.equal((await call(f.auth, "check", { email })).body.status, "has_password")
    assert.equal((await call(f.auth, "login", { email })).code, 400)
    assert.equal((await call(f.auth, "login", { email, password: "incorrect" })).code, 401)
    const response = await call(f.auth, "login", { email, password: "ordinary-password" })
    assert.equal(response.code, 200)
    assert.equal(response.body.isAdmin, isAdmin)
    const cookie = response.headers["Set-Cookie"].split(";")[0]
    assert.equal((await call(f.auth, "me", {}, cookie, "GET")).body.isAdmin, isAdmin)
    assert.equal((await call(f.admin, "notify", { title: "Normal admin", body: "An announcement" }, cookie)).code, isAdmin ? 200 : 403)
  }
  assert.equal(f.tables.notifications.length, 1)
  assert.equal((await call(f.auth, "check", { email: "unregistered@example.test" })).body.status, "not_registered")
})

test("a guest synchronization failure cannot silently issue a new session", async context => {
  const f = await fixture(context)
  context.mock.method(console, "error", () => {})
  f.fail("app_users")
  const response = await call(f.auth, "check", { email: ministryEmails[0] })
  assert.equal(response.code, 500)
  assert.equal(response.headers["Set-Cookie"], undefined)
})
