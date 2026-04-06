import { useState, useEffect, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { api } from "../lib/api"

export function EmailPage() {
  const { user, isLoading, setPendingEmail, pendingEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(pendingEmail)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Redirect away if already logged in
  useEffect(() => {
    if (!isLoading && user) navigate("/app/home", { replace: true })
  }, [isLoading, user, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    const normalized = email.trim().toLowerCase()
    if (!normalized) return
    setSubmitting(true)
    try {
      const { status } = await api.checkEmail(normalized)
      setPendingEmail(normalized)
      if (status === "not_registered") {
        setError(
          "No registration found for this email. Please register at denuchange.vercel.app first, then try again."
        )
      } else if (status === "needs_password") {
        // Trigger first setup email automatically. Rate-limit (429) is expected
        // on quick retries and silently ignored, but any other failure surfaces
        // to the user so we don't navigate to a page that lies about having
        // sent an email.
        try {
          await api.sendSetupEmail(normalized)
        } catch (err) {
          const apiErr = err as { status?: number; message?: string }
          if (apiErr?.status !== 429) {
            console.error("sendSetupEmail failed:", apiErr)
            setError(
              apiErr?.message ??
                "Could not send the setup email. Please try again in a moment or contact the organizers."
            )
            return
          }
        }
        navigate("/app/auth/setup")
      } else {
        navigate("/app/auth/login")
      }
    } catch (err) {
      const apiErr = err as { status?: number; message?: string }
      if (apiErr?.status && apiErr.status >= 500) {
        setError("Server error — please try again or contact the organizers.")
      } else {
        setError(apiErr?.message ?? "Something went wrong. Please check your connection and try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || user) return null

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/logo-denuchange.jpg"
            alt="DENUCHANGE"
            className="h-16 w-16 rounded-xl object-cover mb-4 shadow-md"
          />
          <h1 className="text-xl font-bold text-foreground">DENUCHANGE 2026</h1>
          <p className="text-sm text-muted-foreground mt-1">Attendee App · Naxos, Greece</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              required
              maxLength={254}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
              transition-opacity disabled:opacity-50 hover:opacity-90 active:opacity-80"
          >
            {submitting ? "Checking…" : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Use the same email address you registered with at{" "}
          <a
            href="https://denuchange.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            denuchange.vercel.app
          </a>
        </p>
      </div>
    </div>
  )
}
