import { useState, useEffect, useCallback } from "react"

const navItems = [
  { href: "#program", label: "Program" },
  { href: "#labs", label: "Labs" },
  { href: "#field-trip", label: "Field Trip" },
  { href: "#registration", label: "Registration" },
  { href: "#app", label: "App" },
  { href: "#travel", label: "Travel & Accommodation" },
  { href: "#committees", label: "Organizers" },
  { href: "#contact", label: "Contact" },
]

function useActiveSection() {
  const [active, setActive] = useState("")

  useEffect(() => {
    const ids = navItems.map((i) => i.href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0px -65% 0px" }
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return active
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  const onScroll = useCallback(() => setScrolled(window.scrollY > 20), [])
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [onScroll])
  return scrolled
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const activeSection = useActiveSection()
  const scrolled = useScrolled()

  return (
    <nav
      className={`fixed left-1/2 top-2 z-50 w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] -translate-x-1/2 overflow-hidden rounded-2xl border backdrop-blur-2xl backdrop-saturate-150 transition-[border-color,background-color,box-shadow] duration-300 ease-out min-[1120px]:w-max ${
        scrolled
          ? "border-white/60 bg-white/[0.82] shadow-[0_10px_34px_-20px_rgba(15,23,42,0.55)]"
          : "border-white/45 bg-white/[0.54] shadow-[0_14px_40px_-24px_rgba(15,23,42,0.65)]"
      }`}
    >
      <div className="flex h-12 w-full items-center justify-between gap-6 px-4 min-[1120px]:w-auto min-[1120px]:justify-start min-[1120px]:gap-7">
        {/* Brand */}
        <a href="#" className="group flex shrink-0 cursor-pointer items-center gap-2.5">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-denuchange.jpg`}
            alt="DENUCHANGE"
            className="h-8 w-8 rounded-full object-cover ring-1 ring-primary/20 transition-all group-hover:ring-primary/40"
            width={32}
            height={32}
          />
          <div className="flex flex-col leading-none">
            <span
              className="text-[13px] font-bold tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
            >
              DENUCHANGE
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Workshop 2026
            </span>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 min-[1120px]:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-[0.01em] transition-colors duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-foreground/65 hover:bg-white/35 hover:text-foreground"
                }`}
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-2.5 right-2.5 h-px rounded-full bg-primary"
                  style={{
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
                    transformOrigin: "center",
                  }}
                />
              </a>
            )
          })}
        </div>

        {/* Mobile menu button */}
        <button
          className="cursor-pointer p-2 min-[1120px]:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      <div
        className="overflow-hidden border-t border-white/35 bg-white/25 min-[1120px]:hidden"
        style={{
          maxHeight: isOpen ? "400px" : "0",
          opacity: isOpen ? 1 : 0,
          transition: "max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease",
        }}
      >
        <div className="flex flex-col gap-0.5 px-2 py-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1)
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`cursor-pointer rounded-md px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-foreground/70 hover:bg-white/35 hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
