
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border border-transparent text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3762FB]/15 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative isolate overflow-hidden bg-[#3762FB] text-[#F8FAFC] shadow-[0px_1px_2px_rgba(14,18,27,0.239216),0px_0px_0px_1px_#3762FB] before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)] before:content-[''] hover:bg-[#3158EE] [&>*]:relative [&>*]:z-10",
        destructive:
          "bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_100%),hsl(var(--destructive))] text-destructive-foreground shadow-[0px_1px_2px_rgba(127,29,29,0.2)] hover:brightness-[0.98]",
        outline:
          "border-[#E2E8F0] bg-white text-[#020817] shadow-[0px_1px_2px_rgba(15,23,42,0.05)] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]",
        secondary:
          "border-[#E2E8F0] bg-[#F8FAFC] text-[#020817] shadow-[0px_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#F1F5F9]",
        ghost:
          "border-transparent bg-transparent text-[#020817] shadow-none hover:bg-[#F8FAFC] hover:text-[#020817] dark:text-foreground dark:hover:bg-accent dark:hover:text-foreground",
        link: "border-transparent bg-transparent text-[#3762FB] shadow-none underline-offset-4 hover:underline",
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
