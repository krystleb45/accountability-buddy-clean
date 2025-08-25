// components/ui/ProgressBar.tsx
"use client"

import clsx from "clsx"
import { motion } from "motion/react"
import React from "react"

type ColorKey = "green" | "blue" | "yellow" | "purple" | "gray"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional label above the bar */
  label?: string
  /** Current progress value */
  value: number
  /** Maximum possible value */
  max: number
  /** Tailwind color key */
  color?: ColorKey
  /** Whether to show the "x / y (z%)" text */
  showText?: boolean
  /** Extra container classes */
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label = "Progress",
  value,
  max,
  color = "green",
  showText = true,
  className = "",
  ...rest
}) => {
  // Clamp percentage to 0–100
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  const colorClasses: Record<ColorKey, string> = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-400",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
  }

  return (
    <div className={clsx("w-full", className)} {...rest}>
      {label && <p className="mb-1 text-sm font-medium text-white">{label}</p>}
      <div
        className={`
          h-5 w-full overflow-hidden rounded-full bg-gray-700 shadow-inner
        `}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={clsx(
            "h-full rounded-full",
            // cast to ColorKey so TS knows it's one of the keys
            colorClasses[color as ColorKey],
          )}
        />
      </div>
      {showText && (
        <p className="mt-1 text-xs text-gray-300">
          {value} / {max} ({Math.floor(pct)}%)
        </p>
      )}
    </div>
  )
}

export default ProgressBar
