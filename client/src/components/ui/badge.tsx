import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[44px] touch-manipulation",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        premium:
          "bg-gradient-to-r from-[#6B21A8] to-[#F59E0B] text-white border-2 border-[#D4AF37] shadow-lg hover:shadow-xl active:scale-95 focus:ring-[#D4AF37] uppercase tracking-wide font-bold px-4 py-2 transform hover:scale-105",
        status:
          "bg-white/95 backdrop-blur-sm shadow-lg border-2 px-3 py-2 font-bold uppercase tracking-wide",
        personality:
          "bg-gradient-to-r from-[#6B21A8] to-[#F59E0B] text-white border border-[#D4AF37]/30 shadow-md hover:shadow-lg px-3 py-2 font-bold uppercase tracking-wide transform hover:scale-105 active:scale-95",
      },
      size: {
        sm: "px-2 py-1 text-xs min-h-[32px]",
        default: "px-3 py-2 text-sm min-h-[40px]", 
        lg: "px-4 py-3 text-base min-h-[48px]",
      },
      tone: {
        primary: "data-[tone=primary]",
        success: "data-[tone=success]", 
        warning: "data-[tone=warning]",
        danger: "data-[tone=danger]",
        info: "data-[tone=info]",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, tone, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(badgeVariants({ variant, size, tone }), className)} 
        {...props} 
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
