import { useState, useEffect, type FormEvent } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { api } from "../lib/api"
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"

type Strength = "weak" | "fair" | "strong"

function getStrength(pw: string): Strength {
  if (pw.length < 8) return "weak"
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasDigit = /[0-9]/.test(pw)
  const hasSpecial = /[^A-Za-z0-9]/.test(pw)
  const score = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
  if (pw.length >= 12 && score >= 3) return "strong"
  return "fair"
}

const STRENGTH_CONFIG: Record<Strength, { label: string; color: string; bars: number }> = {
  weak: { label: "Too short (min 8 characters)", color: "bg-destructive", bars: 1 },
  fair: { label: "Fair – try adding numbers or symbols", color: "bg-warning", bars: 2 },
  strong: { label: "Strong password", color: "bg-green-500", bars: 3 },
}

export function SetupPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? ""

  const [tokenState, setTokenState] = useState<"loading" | "valid" | "invalid">("loading")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setTokenState("invalid")
      return
    }
    api
      .verifySetupToken(token)
      .then((res) => {
        if (res.valid && res.email) {
          setEmail(res.email)
          setTokenState("valid")
        } else {
          setTokenState("invalid")
        }
      })
      .catch(() => setTokenState("invalid"))
  }, [token])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setSubmitting(true)
    try {
      await api.setPassword(token, password)
      setDone(true)
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } }
      setError(apiErr?.data?.error ?? "Something went wrong. The link may have expired.")
    } finally {
      setSubmitting(false)
    }
  }

  const strength = password ? getStrength(password) : null

  if (tokenState === "loading") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (tokenState === "invalid") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background text-center">
        <XCircle className="h-14 w-14 text-destructive mb-4" />
        <h1 className="text-xl font-bold text-foreground">Link invalid or expired</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          This password-setup link has already been used or has expired (24h). Go back and request a new one.
        </p>
        <button
          onClick={() => navigate("/app/auth/setup")}
          className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
        >
          Request new link
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500 mb-4" />
        <h1 className="text-xl font-bold text-foreground">Password created!</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Your password has been set for <strong>{email}</strong>. You can now log in to the app.
        </p>
        <button
          onClick={() => navigate("/app/auth/login")}
          className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
        >
          Go to login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/logo-denuchange.jpg"
            alt="DENUCHANGE"
            className="h-16 w-16 rounded-xl object-cover mb-4 shadow-md"
          />
          <h1 className="text-xl font-bold text-foreground">Create your password</h1>
          <p className="text-sm text-muted-foreground mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="pw">
              New password
            </label>
            <div className="relative">
              <input
                id="pw"
                type={showPw ? "text" : "password"}
                value={password}
                autoComplete="new-password"
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                required
                minLength={8}
                maxLength={128}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {strength && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {([1, 2, 3] as const).map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        bar <= STRENGTH_CONFIG[strength].bars
                          ? STRENGTH_CONFIG[strength].color
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{STRENGTH_CONFIG[strength].label}</p>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="pw-confirm">
              Confirm password
            </label>
            <input
              id="pw-confirm"
              type={showPw ? "text" : "password"}
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => {
                setConfirm(e.target.value)
                setError("")
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground
                focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || password.length < 8 || password !== confirm}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
              transition-opacity disabled:opacity-50 hover:opacity-90 active:opacity-80"
          >
            {submitting ? "Setting password…" : "Set password"}
          </button>
        </form>
      </div>
    </div>
  )
}
