import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='text-'])]:size-4.5 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer relative uppercase transform-style-3d",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground bg-primary border-2 border-primary-foreground/20 rounded-xl shadow-[0_0_0_2px_hsl(var(--primary)),_0_0.625em_0_0_hsl(var(--primary)/20)] hover:-translate-y-1 hover:shadow-[0_0_0_2px_hsl(var(--primary)),_0_0.5em_0_0_hsl(var(--primary)/20)] active:translate-y-[0.75em] active:shadow-[0_0_0_2px_hsl(var(--primary)),_0_0_0_0_hsl(var(--primary)/20)] before:absolute before:inset-0 before:bg-primary/90 before:-translate-z-4 before:rounded-xl",
        destructive:
          "text-destructive-foreground bg-destructive border-2 border-destructive-foreground/20 rounded-xl shadow-[0_0_0_2px_hsl(var(--destructive)),_0_0.625em_0_0_hsl(var(--destructive)/20)] hover:-translate-y-1 hover:shadow-[0_0_0_2px_hsl(var(--destructive)),_0_0.5em_0_0_hsl(var(--destructive)/20)] active:translate-y-[0.75em] active:shadow-[0_0_0_2px_hsl(var(--destructive)),_0_0_0_0_hsl(var(--destructive)/20)] before:absolute before:inset-0 before:bg-destructive/90 before:-translate-z-4 before:rounded-xl",
        outline:
          "text-foreground bg-background border-2 border-input rounded-xl shadow-[0_0_0_2px_hsl(var(--input)),_0_0.625em_0_0_hsl(var(--muted))] hover:-translate-y-1 hover:shadow-[0_0_0_2px_hsl(var(--input)),_0_0.5em_0_0_hsl(var(--muted))] hover:bg-muted/50 active:translate-y-[0.75em] active:shadow-[0_0_0_2px_hsl(var(--input)),_0_0_0_0_hsl(var(--muted))] before:absolute before:inset-0 before:bg-background/90 before:-translate-z-4 before:rounded-xl",
        secondary:
          "text-secondary-foreground bg-secondary border-2 border-secondary-foreground/10 rounded-xl shadow-[0_0_0_2px_hsl(var(--secondary-foreground)/10),_0_0.625em_0_0_hsl(var(--secondary)/80)] hover:-translate-y-1 hover:shadow-[0_0_0_2px_hsl(var(--secondary-foreground)/10),_0_0.5em_0_0_hsl(var(--secondary)/80)] active:translate-y-[0.75em] active:shadow-[0_0_0_2px_hsl(var(--secondary-foreground)/10),_0_0_0_0_hsl(var(--secondary)/80)] before:absolute before:inset-0 before:bg-secondary/90 before:-translate-z-4 before:rounded-xl",
        ghost: "hover:bg-primary/5 hover:text-primary transition-colors rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        warning:
          "text-[var(--warning-foreground)] bg-[var(--warning)] border-2 border-[var(--warning-foreground)]/20 rounded-xl shadow-[0_0_0_2px_hsl(86_100%_40%),_0_0.625em_0_0_hsl(86_100%_40%/20)] hover:-translate-y-1 hover:shadow-[0_0_0_2px_hsl(86_100%_40%),_0_0.5em_0_0_hsl(86_100%_40%/20)] active:translate-y-[0.75em] active:shadow-[0_0_0_2px_hsl(86_100%_40%),_0_0_0_0_hsl(86_100%_40%/20)] before:absolute before:inset-0 before:bg-[var(--warning)]/90 before:-translate-z-4 before:rounded-xl",
      },
      size: {
        default: "px-8 py-3.5 text-[15px] mb-[0.625em]",
        sm: "px-6 py-2.5 text-sm mb-[0.625em]",
        lg: "px-10 py-4 text-base mb-[0.625em]",
        icon: "size-11 mb-[0.625em]",
        "icon-sm": "size-9 mb-[0.625em]",
        "icon-lg": "size-12 mb-[0.625em]",
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
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
