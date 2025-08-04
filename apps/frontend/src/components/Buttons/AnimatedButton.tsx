// src/components/Buttons/AnimatedButton.tsx
import React from "react"

import styles from "./AnimatedButton.module.css"

interface AnimatedButtonProps {
  label: string
  onClick?: () => void
  variant?: "primary" | "secondary" | "outline"
  size?: "small" | "medium" | "large"
  isLoading?: boolean
  disabled?: boolean
  isPinned?: boolean // track pin state
  className?: string // additional custom styling
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled = false,
  isPinned = false,
  className = "",
}) => {
  // Determine inner content
  let content: React.ReactNode = label
  if (isLoading) {
    content = <span className={styles.spinner} />
  } else if (isPinned) {
    content = <>📌 Unpin {label}</>
  }

  // Determine aria-label
  const ariaLabel = isLoading
    ? `Loading ${label}`
    : isPinned
      ? `Unpin ${label}`
      : label

  return (
    <button
      className={[
        styles["animated-button"],
        styles[variant],
        styles[size],
        isPinned ? styles.pinned : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={isLoading || disabled}
      aria-label={ariaLabel}
      aria-busy={isLoading}
    >
      {content}
    </button>
  )
}

export default AnimatedButton
