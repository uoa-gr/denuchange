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
      className={`fixed z-50 border backdrop-blur-xl transition-[top,left,right,border-color,border-radius,background-color,box-shadow] duration-300 ease-out ${
        scrolled
          ? "inset-x-0 top-0 rounded-none border-x-0 border-t-0 border-border bg-background/95 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.35)]"
          : "inset-x-3 top-3 rounded-xl border-white/60 bg-white/[0.72] shadow-[0_12px_36px_-22px_rgba(15,23,42,0.7)]"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 cursor-pointer group">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-denuchange.jpg`}
            alt="DENUCHANGE"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
            width={36}
            height={36}
          />
          <div className="flex flex-col leading-none">
            <span
              className="text-sm font-bold tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
            >
              DENUCHANGE
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
              Workshop 2026
            </span>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors duration-300 cursor-pointer rounded-md ${
                  isActive
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
                <span
                  className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-primary rounded-full"
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
          className="md:hidden p-2 cursor-pointer"
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
        className="md:hidden border-t bg-background overflow-hidden"
        style={{
          maxHeight: isOpen ? "400px" : "0",
          opacity: isOpen ? 1 : 0,
          transition: "max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease",
        }}
      >
        <div className="container py-3 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1)
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-[13px] font-semibold uppercase tracking-wide py-2.5 px-3 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
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
