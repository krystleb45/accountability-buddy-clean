import type { KeyboardEvent } from "react"

import React from "react"

import { combineClassNames, generateCardId } from "@/utils/CardUtils"

import styles from "./Card.module.css"

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  elevated?: boolean
  bordered?: boolean
  id?: string // optional custom ID
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  elevated = false,
  bordered = false,
  id,
}) => {
  const cardId = id ?? generateCardId()

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick()
    }
  }

  const cardClasses = combineClassNames(
    styles.card,
    "bg-gray-800 text-white rounded-lg p-4 transition-transform duration-200",
    elevated && "shadow-2xl scale-105",
    bordered && "border border-green-500",
    "hover:shadow-green-400/50 hover:scale-105 hover:border-green-400",
    className,
  )

  return (
    <div
      id={cardId}
      className={cardClasses}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? "false" : undefined}
    >
      {children}
    </div>
  )
}

export default Card

/**
 * A simple sub-component to wrap content within a Card.
 */
export const CardContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={combineClassNames("p-4", className)}>{children}</div>
)
