"use client"

import { CheckCircle, BadgeCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  showText?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  withBackground?: boolean
}

export function VerifiedBadge({ 
  showText = false, 
  size = "md", 
  className,
  withBackground = true 
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }
  
  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  const iconSizeClasses = {
    sm: 14,
    md: 20,
    lg: 24
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1.5", className)}>
            {withBackground ? (
              <div className={cn(
                "rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center",
                size === "sm" ? "p-0.5" : size === "md" ? "p-1" : "p-1"
              )}>
                <CheckCircle 
                  className={cn(sizeClasses[size], "text-white")} 
                  strokeWidth={2.5}
                />
              </div>
            ) : (
              <BadgeCheck 
                className={cn(sizeClasses[size], "text-blue-500 fill-blue-500/10")}
                strokeWidth={1.8}
              />
            )}
            {showText && (
              <span className={cn(
                textClasses[size], 
                "text-blue-600 dark:text-blue-400 font-semibold"
              )}>
                Terverifikasi
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
            <p>Akun resmi terverifikasi</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}