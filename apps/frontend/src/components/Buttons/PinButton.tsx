// src/components/Buttons/PinButton.tsx
"use client"

import clsx from "clsx"
import React from "react"

import styles from "./Button.module.css"

export interface PinButtonProps {
  isPinned: boolean
  onToggle: () => void
  size?: "sm" | "md" | "lg"
  className?: string
}

const PinButton: React.FC<PinButtonProps> = ({
  isPinned,
  onToggle,
  size = "md",
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isPinned}
      aria-label={isPinned ? "Unpin item" : "Pin item"}
      className={clsx(
        styles.base, // base button styles
        styles[size], // size variant from Button.module.css
        isPinned ? styles.active : styles.inactive,
        className, // allow extra overrides
      )}
    >
      {isPinned ? "📌 Unpin" : "📍 Pin"}
    </button>
  )
}

export default PinButton
