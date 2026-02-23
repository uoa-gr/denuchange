import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Calendar,
  MapPin,
  Image,
  Users,
  WifiOff,
  Smartphone,
  Monitor,
  CheckCircle2,
} from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Platform = "ios" | "android" | "desktop"

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return "ios"
  if (/Android/.test(ua)) return "android"
  return "desktop"
}

function Step({ n }: { n: number }) {
  return (
    <span className="shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  )
}

const features = [
  { icon: Bell,     label: "Real-time alerts",    sub: "Push notifications from organizers" },
  { icon: Calendar, label: "Full program",         sub: "Sessions, times & rooms" },
  { icon: MapPin,   label: "Field trip map",       sub: "Interactive stops & directions" },
  { icon: Image,    label: "Photo gallery",        sub: "Official event photos" },
  { icon: Users,    label: "Participants",         sub: "Browse attendees & affiliations" },
  { icon: WifiOff,  label: "Works offline",        sub: "No signal? No problem" },
]

export function AttendeeApp() {
  const [platform, setPlatform] = useState<Platform>("desktop")
  const [isStandalone, setIsStandalone] = useState(false)
  const [installable, setInstallable] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setPlatform(detectPlatform())
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true
    )
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setInstallable(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    await deferredPrompt.current.userChoice
    deferredPrompt.current = null
    setInstallable(false)
  }

  return (
    <section id="app" className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Smartphone className="h-3 w-3" />
            Attendee App
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Your conference companion
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A free app for registered attendees. Works on all devices — no app store required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex gap-3 items-start">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Install panel */}
          <Card className="p-6">
            {isStandalone ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold">App already installed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're running the installed version.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold mb-4">How to install on your device:</p>

                {/* Platform selector */}
                <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
                  {(["ios", "android", "desktop"] as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                        platform === p
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p === "ios" ? "iPhone / iPad" : p === "android" ? "Android" : "Desktop"}
                    </button>
                  ))}
                </div>

                {/* iOS */}
                {platform === "ios" && (
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3 items-start">
                      <Step n={1} />
                      <span>
                        Open this page in <strong>Safari</strong>{" "}
                        <span className="text-muted-foreground">(Chrome on iOS won't work for installation)</span>
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <Step n={2} />
                      <span>
                        Tap the <strong>Share</strong> button{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">⎙</code> in
                        Safari's bottom toolbar
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <Step n={3} />
                      <span>
                        Scroll down and tap <strong>"Add to Home Screen"</strong>
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <Step n={4} />
                      <span>
                        Tap <strong>Add</strong> in the top-right corner
                      </span>
                    </li>
                  </ol>
                )}

                {/* Android */}
                {platform === "android" && (
                  <div className="text-sm">
                    {installable ? (
                      <Button className="w-full gap-2" onClick={handleInstall}>
                        <Smartphone className="h-4 w-4" />
                        Install App
                      </Button>
                    ) : (
                      <ol className="space-y-3">
                        <li className="flex gap-3 items-start">
                          <Step n={1} />
                          <span>
                            Open this page in <strong>Chrome</strong>
                          </span>
                        </li>
                        <li className="flex gap-3 items-start">
                          <Step n={2} />
                          <span>
                            Tap the{" "}
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">⋮</code> menu
                            (top right) then tap <strong>"Add to Home Screen"</strong>
                          </span>
                        </li>
                      </ol>
                    )}
                  </div>
                )}

                {/* Desktop */}
                {platform === "desktop" && (
                  <div className="text-sm space-y-4">
                    {installable ? (
                      <>
                        <Button className="w-full gap-2" onClick={handleInstall}>
                          <Monitor className="h-4 w-4" />
                          Install App
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          For push notifications, also install on your smartphone.
                        </p>
                      </>
                    ) : (
                      <ol className="space-y-3">
                        <li className="flex gap-3 items-start">
                          <Step n={1} />
                          <span>
                            Open this page in <strong>Chrome</strong> or <strong>Edge</strong>
                          </span>
                        </li>
                        <li className="flex gap-3 items-start">
                          <Step n={2} />
                          <span>
                            Click the install icon{" "}
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">⊕</code> in
                            the address bar
                          </span>
                        </li>
                      </ol>
                    )}
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      For real-time push notifications, install on your <strong>smartphone</strong>.
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t">
                  <a href="/app/" className="text-xs text-primary hover:underline">
                    → Open app in browser without installing
                  </a>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
