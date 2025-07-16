
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
          "bg-blue-50 text-blue-700 ring-blue-700/10",
        "monthly-retainer": 
          "bg-purple-50 text-purple-700 ring-purple-700/10",
        "monthly-pay": 
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        
        // Status variants
        "planning":
          "bg-blue-50 text-blue-700 ring-blue-700/10",
        "in-progress":
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        "completed":
          "bg-green-50 text-green-700 ring-green-600/20",
        "paused":
          "bg-purple-50 text-purple-700 ring-purple-700/10",
        "cancelled":
          "bg-red-50 text-red-700 ring-red-600/20",
        
        // Brief status variants
        "new":
          "bg-blue-50 text-blue-700 ring-blue-700/10",
        
        // Lead stage variants  
        "first-meeting":
          "bg-blue-50 text-blue-700 ring-blue-700/10",
        "follow-up":
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        "moodboard":
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        "down-payment":
          "bg-primary text-primary-foreground border-transparent",
        "kickoff":
          "bg-green-50 text-green-700 ring-green-600/20",
        "finish":
          "bg-green-50 text-green-700 ring-green-600/20",
        
        // Category/Skill variant
        "category":
          "bg-background text-foreground ring-border",
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
