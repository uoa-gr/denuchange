import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='text-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-blue-500 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:from-blue-500 hover:to-primary border border-primary/20",
        destructive:
          "bg-gradient-to-r from-destructive to-red-500 text-destructive-foreground shadow-md hover:shadow-destructive/50",
        outline:
          "border-2 border-input bg-background shadow-sm hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors",
        secondary:
          "bg-gradient-to-r from-secondary to-slate-200 text-secondary-foreground shadow-sm hover:shadow-md",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        warning:
          "bg-gradient-to-r from-[var(--warning)] to-amber-400 text-[var(--warning-foreground)] shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-400 hover:to-[var(--warning)] border border-amber-500/20",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-lg",
        "icon-sm": "size-9 rounded-md",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Ensure the Slot can take motion props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionSlot = motion.create ? motion.create(Slot) : (motion as any)(Slot)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? MotionSlot : motion.button

    // Classes for the inner shine effect, applied using a wrapper to avoid interfering with Slot and specific variants
    const isPremiumVariant = variant === "default" || variant === "warning" || variant === "destructive"

    return (
      <Comp
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          buttonVariants({ variant, size, className }),
          isPremiumVariant &&
            "before:absolute before:inset-0 before:-translate-x-[150%] before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
