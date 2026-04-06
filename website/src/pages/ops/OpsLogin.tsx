import { useState } from "react"
import type { FormEvent } from "react"
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
