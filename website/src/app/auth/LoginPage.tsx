import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { api } from "../lib/api"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export function LoginPage() {
  const { pendingEmail, setPendingEmail, setUser } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!pendingEmail) {
    navigate("/app/auth/email", { replace: true })
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (!password) return
    setSubmitting(true)
    try {
      const user = await api.login(pendingEmail, password)
      setUser(user)
      navigate("/app/home", { replace: true })
    } catch {
      setError("Incorrect password. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleChangeEmail() {
    setPendingEmail("")
    navigate("/app/auth/email")
  }

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
          <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
        </div>

        {/* Email pill */}
        <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 mb-4">
          <span className="text-sm text-foreground truncate">{pendingEmail}</span>
          <button
            onClick={handleChangeEmail}
            className="text-xs text-primary ml-2 flex-none flex items-center gap-1 hover:opacity-70"
          >
            <ArrowLeft className="h-3 w-3" />
            Change
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="pw-login">
              Password
            </label>
            <div className="relative">
              <input
                id="pw-login"
                type={showPw ? "text" : "password"}
                value={password}
                autoFocus
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground
                  focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                required
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
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
              transition-opacity disabled:opacity-50 hover:opacity-90 active:opacity-80"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center">
          <button
            onClick={() => navigate("/app/auth/setup")}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Forgot password? Request a new setup link
          </button>
        </p>
      </div>
    </div>
  )
}
