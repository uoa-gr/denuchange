import { cn } from "@/lib/utils"

const navItems = [
  { href: "#about", label: "About" },
  { href: "#program", label: "Program" },
  { href: "#field-trip", label: "Field Trip" },
  { href: "#registration", label: "Registration" },
  { href: "#travel", label: "Travel" },
  { href: "#contact", label: "Contact" },
]

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <img
            src="/images/logo-denuchange.jpg"
            alt="DENUCHANGE"
            className="h-10 w-10 rounded-full object-cover"
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
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile menu button - simplified for now */}
        <button className="md:hidden p-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  )
}

