"use client"

import type { ToasterProps } from "sonner"

import { AlertCircle, X } from "lucide-react"
import { Toaster as Sonner } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--error-bg":
            "color-mix(in oklab, var(--destructive) 40%, var(--background))",
          "--error-text": "var(--destructive-foreground)",
          "--error-border": "var(--destructive)",
        } as React.CSSProperties
      }
      richColors
      closeButton
      icons={{
        error: <AlertCircle className="size-5" />,
        close: <X className="size-3" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
