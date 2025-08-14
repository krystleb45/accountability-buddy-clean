"use client"

import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  /** Diameter of spinner in pixels */
  size?: number
  /** If true, render full-screen overlay */
  overlay?: boolean
}

export function LoadingSpinner({
  size = 72,
  overlay = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn({
        "absolute inset-0 z-50 flex size-full items-center justify-center bg-foreground/10":
          overlay,
      })}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="loading-spinner"
    >
      <Loader2
        className="animate-spin duration-500"
        size={size}
        stroke="var(--primary)"
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
