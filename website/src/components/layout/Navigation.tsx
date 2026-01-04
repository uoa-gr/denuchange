import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "#about", label: "About" },
  { href: "#program", label: "Program" },
  { href: "#field-trip", label: "Field Trip" },
  { href: "#registration", label: "Registration" },
  { href: "#travel", label: "Travel & Stay" },
  { href: "#contact", label: "Contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="bg-[#1e73be]">
        <div className="container flex h-14 items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-denuchange.jpg`}
            alt="DENUCHANGE"
            className="h-10 w-10 rounded-full object-cover"
            width={40}
            height={40}
          />
          <span className="font-semibold text-sm tracking-tight text-white">
            DENUCHANGE 2026
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-white/90 transition-colors hover:text-white"
              )}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white"
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
      </div>
      {/* Yellow wave accent */}
      <svg
        className="w-full h-3 -mb-px"
        viewBox="0 0 1200 12"
        preserveAspectRatio="none"
        fill="#f1c100"
      >
        <path d="M0,0 C300,12 600,0 900,12 C1050,6 1200,0 1200,0 L1200,12 L0,12 Z" />
      </svg>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-[#f1c100] bg-[#1e73be]">
          <div className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-white/90 hover:text-white py-2 px-2 rounded hover:bg-white/10 transition-colors"
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
