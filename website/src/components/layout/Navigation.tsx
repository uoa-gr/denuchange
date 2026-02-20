import { useState, useEffect } from "react"

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
      { rootMargin: "-40% 0px -55% 0px" }
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return active
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const activeSection = useActiveSection()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                activeSection === item.href.slice(1)
                  ? "text-primary"
                  : "text-foreground hover:text-muted-foreground"
              }`}
            >
              {item.label}
            </a>
          ))}
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
