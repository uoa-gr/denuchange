import { useState, useEffect, useCallback } from "react"

const navItems = [
  { href: "#program", label: "Program" },
  { href: "#labs", label: "Labs" },
  { href: "#field-trip", label: "Field Trip" },
  { href: "#registration", label: "Registration" },
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
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{
        boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-3 cursor-pointer">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-denuchange.jpg`}
            alt="DENUCHANGE"
            className="h-10 w-10 rounded-full object-cover"
            width={40}
            height={40}
          />
          <span className="font-semibold text-sm tracking-tight">
            DENUCHANGE 2026
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative text-sm font-medium transition-colors duration-300 cursor-pointer ${
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.label}
                <span
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full"
                  style={{
                    width: isActive ? "100%" : "0%",
                    transition: "width 0.3s cubic-bezier(0.22,1,0.36,1)",
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
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground hover:text-muted-foreground py-2 px-2 rounded hover:bg-muted transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
