// src/components/BadgeSystem/Badge.tsx
"use client"

import clsx from "clsx"
import React from "react"

export interface BadgeProps {
  label: string
  type?: "success" | "warning" | "error" | "info"
  icon?: React.ReactNode
  /** Custom background color (CSS color string) */
  color?: string
}

const typeStyles: Record<Required<BadgeProps>["type"], string> = {
  success: "bg-green-500 text-white",
  warning: "bg-yellow-400 text-black",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
}

const Badge: React.FC<BadgeProps> = ({ label, type = "info", icon, color }) => {
  const baseStyle =
    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"

  // If a custom color is provided, fall back to inline styles
  if (color) {
    return (
      <span
        className={clsx(baseStyle, "text-white")}
        style={{ backgroundColor: color }}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
    )
  }

  // Otherwise use our predefined type styles
  return (
    <span className={clsx(baseStyle, typeStyles[type])}>
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
  )
}

export default Badge
