// components/ui/Progress.tsx
"use client"

import React from "react"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Percentage from 0 to 100 */
  value: number
  /** Optional label above the bar */
  label?: string
  /** Tailwind height class, e.g. 'h-2' or 'h-4' */
  height?: string
  /** Tailwind background color class for the filled portion */
  color?: string
}

/**
 * A simple horizontal progress bar.
 */
const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  height = "h-4",
  color = "bg-green-500",
  className = "",
  ...rest
}) => {
  // Clamp between 0 and 100
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      className={`
        w-full
        ${className}
      `}
      {...rest}
    >
      {label && (
        <div className="mb-1 text-xs font-medium text-gray-300">{label}</div>
      )}
      <div
        className={`
          w-full overflow-hidden rounded-full bg-gray-800
          ${height}
        `}
      >
        <div
          className={`
            rounded-full
            ${height}
            ${color}
          `}
          style={{
            width: `${clamped}%`,
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">{clamped}% Complete</p>
    </div>
  )
}

export default Progress
