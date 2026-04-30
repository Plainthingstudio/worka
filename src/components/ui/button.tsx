
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border border-transparent text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative isolate overflow-hidden bg-primary text-primary-foreground shadow-[0px_1px_2px_rgba(14,18,27,0.239216)] ring-1 ring-primary before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)] before:content-[''] hover:bg-primary/90 [&>*]:relative [&>*]:z-10",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0px_1px_2px_rgba(127,29,29,0.2)] hover:bg-destructive/90",
        outline:
          "border-border-soft bg-card text-foreground shadow-[0px_1px_2px_rgba(15,23,42,0.05)] hover:bg-accent",
        secondary:
          "border-border-soft bg-surface-2 text-foreground shadow-[0px_1px_2px_rgba(15,23,42,0.04)] hover:bg-accent",
        ghost:
          "border-transparent bg-transparent text-foreground shadow-none hover:bg-accent hover:text-foreground",
        link: "border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[38px] px-3 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
