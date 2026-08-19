import { useEffect, useRef, useState } from "react"

type Direction = "up" | "left" | "right"

const transforms: Record<Direction, string> = {
  up: "translateY(4rem)",
  left: "translateX(-4rem)",
  right: "translateX(4rem)",
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: Direction
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.03 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`overflow-x-clip ${className}`}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translate(0)" : transforms[direction],
          transition: `opacity 1.2s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
