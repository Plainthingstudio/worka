
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
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
        
        // Project type variants
        "project-based":
          "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30",
        "monthly-retainer":
          "bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/30",
        "monthly-pay":
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/15 dark:text-yellow-300 dark:ring-yellow-400/30",
        
        // Status variants
        "planning":
          "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/15 dark:text-gray-300 dark:ring-gray-400/30",
        "in-progress":
          "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30",
        "awaiting-feedback":
          "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/30",
        "completed":
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/30",
        "paused":
          "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/15 dark:text-yellow-300 dark:ring-yellow-400/30",
        "cancelled":
          "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/30",
        
        // Brief status variants
        "new":
          "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30",

        // Lead stage variants
        "first-meeting":
          "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30",
        "follow-up":
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/15 dark:text-yellow-300 dark:ring-yellow-400/30",
        "moodboard":
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/15 dark:text-yellow-300 dark:ring-yellow-400/30",
        "down-payment":
          "bg-primary text-primary-foreground border-transparent",
        "kickoff":
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/30",
        "finish":
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/30",

        // Category/Skill variant
        "category":
          "bg-background text-foreground ring-border",

        // Team role variants
        "role-owner":
          "bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/30",
        "role-administrator":
          "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30",
        "role-team":
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/30",
        "role-default":
          "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/15 dark:text-gray-300 dark:ring-gray-400/30",

        // Lead source variants
        "dribbble":
          "bg-pink-50 text-pink-700 ring-pink-700/10 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-400/30",
        "website":
          "bg-cyan-50 text-cyan-700 ring-cyan-700/10 dark:bg-cyan-500/15 dark:text-cyan-300 dark:ring-cyan-400/30",
        "linkedin":
          "bg-blue-600/10 text-blue-600 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30",
        "behance":
          "bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/30",
        "direct-email":
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/30",
        "other":
          "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/15 dark:text-gray-300 dark:ring-gray-400/30",
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
