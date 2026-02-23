import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { api } from "../lib/api"
import { Mail, RefreshCw, ArrowRight } from "lucide-react"

// Progressive cooldown steps in seconds
const COOLDOWN_STEPS = [30, 60, 90, 120, 150, 180, 240, 300]

export function SetupPendingPage() {
  const { pendingEmail } = useAuth()
  const navigate = useNavigate()
  const [cooldown, setCooldown] = useState(0)
  const [step, setStep] = useState(0) // which cooldown step we're on (first send already triggered in EmailPage)
  const [sending, setSending] = useState(false)
  const [sendMessage, setSendMessage] = useState("")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect if no pending email
  useEffect(() => {
    if (!pendingEmail) navigate("/app/auth/email", { replace: true })
  }, [pendingEmail, navigate])

  // Start initial cooldown (first email was auto-sent from EmailPage)
  useEffect(() => {
    startCooldown(step)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startCooldown(stepIndex: number) {
    const seconds = COOLDOWN_STEPS[Math.min(stepIndex, COOLDOWN_STEPS.length - 1)]
    setCooldown(seconds)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (cooldown > 0 || sending || !pendingEmail) return
    setSending(true)
    setSendMessage("")
    try {
      await api.sendSetupEmail(pendingEmail)
      setSendMessage("Email sent! Check your inbox.")
      const nextStep = step + 1
      setStep(nextStep)
      startCooldown(nextStep)
    } catch (err: unknown) {
      const apiErr = err as { data?: { retryAfter?: number } }
      const retryAfter = apiErr?.data?.retryAfter ?? 30
      setSendMessage(`Please wait ${retryAfter}s before resending.`)
      setCooldown(retryAfter)
      startCooldown(step)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            A password-setup link has been sent to{" "}
            <strong className="text-foreground">{pendingEmail}</strong>.
            Click the link in the email to create your password.
          </p>
        </div>

        {/* Resend */}
        <div className="space-y-2">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || sending}
            className="w-full py-2.5 rounded-lg border border-border text-foreground font-medium text-sm
              transition-opacity disabled:opacity-50 hover:bg-muted flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${sending ? "animate-spin" : ""}`} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : sending ? "Sending…" : "Resend email"}
          </button>

          {sendMessage && (
            <p className="text-xs text-muted-foreground">{sendMessage}</p>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">already set your password?</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Continue to login */}
        <button
          onClick={() => navigate("/app/auth/login")}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
            transition-opacity hover:opacity-90 active:opacity-80 flex items-center justify-center gap-2"
        >
          Continue to login
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Back */}
        <button
          onClick={() => navigate("/app/auth/email")}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Use a different email
        </button>
      </div>
    </div>
  )
}
