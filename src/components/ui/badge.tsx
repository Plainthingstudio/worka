
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground border-transparent",
        outline: "text-foreground",
        // Updated project type variants with enhanced dark mode support
        "project-based": 
          "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-400/30",
        "monthly-retainer": 
          "bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-400/30",
        "monthly-pay": 
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/40 dark:text-yellow-300 dark:ring-yellow-400/30",
        // Status variants with enhanced dark mode support
        "in-progress":
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/40 dark:text-yellow-300 dark:ring-yellow-400/30",
        "completed":
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/40 dark:text-green-300 dark:ring-green-400/30",
        "cancelled":
          "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-400/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
