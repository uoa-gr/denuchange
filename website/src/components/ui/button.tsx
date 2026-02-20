import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='text-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary bg-[image:linear-gradient(to_bottom,oklch(0.58_0.14_250),oklch(0.48_0.14_250))] text-white border border-[oklch(0.40_0.12_250)] shadow-[0_1px_2px_rgba(0,0,0,0.16),0_1px_0_0_oklch(0.40_0.12_250),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-[image:linear-gradient(to_bottom,oklch(0.60_0.14_250),oklch(0.50_0.14_250))] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] active:bg-[image:linear-gradient(to_bottom,oklch(0.45_0.14_250),oklch(0.48_0.14_250))] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]",
        destructive:
          "bg-destructive bg-[image:linear-gradient(to_bottom,oklch(0.63_0.245_27),oklch(0.53_0.245_27))] text-white border border-[oklch(0.45_0.20_27)] shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-[image:linear-gradient(to_bottom,oklch(0.65_0.245_27),oklch(0.55_0.245_27))] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] active:bg-[image:linear-gradient(to_bottom,oklch(0.50_0.245_27),oklch(0.53_0.245_27))] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "bg-primary bg-[image:linear-gradient(to_bottom,oklch(0.58_0.14_250),oklch(0.48_0.14_250))] text-white border border-[oklch(0.40_0.12_250)] shadow-[0_1px_2px_rgba(0,0,0,0.16),0_1px_0_0_oklch(0.40_0.12_250),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-[image:linear-gradient(to_bottom,oklch(0.60_0.14_250),oklch(0.50_0.14_250))] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] active:bg-[image:linear-gradient(to_bottom,oklch(0.45_0.14_250),oklch(0.48_0.14_250))] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]",
        secondary:
          "bg-secondary bg-[image:linear-gradient(to_bottom,white,oklch(0.96_0.01_250))] text-secondary-foreground border border-[oklch(0.88_0.02_250)] shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_white] hover:bg-[image:linear-gradient(to_bottom,oklch(0.98_0.005_250),oklch(0.94_0.01_250))] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:bg-[image:linear-gradient(to_bottom,oklch(0.93_0.01_250),oklch(0.96_0.01_250))] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
