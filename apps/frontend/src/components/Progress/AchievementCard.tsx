// components/Progress/AchievementCard.tsx
"use client"

import clsx from "clsx"
import React from "react"

import Card, { CardContent } from "../cards/Card"
import styles from "./AchievementCard.module.css"

export interface AchievementProps {
  /** Unique identifier (not rendered, but you might use for tracking) */
  id: string
  /** Achievement title */
  title: string
  /** Short description */
  description: string
  /** 0–100 percent progress */
  progress: number
  /** True once unlocked */
  isUnlocked: boolean
  /** Optional icon URL */
  icon?: string
}

const AchievementCard: React.FC<AchievementProps> = ({
  title,
  description,
  progress,
  isUnlocked,
  icon,
}) => {
  // Clamp progress into [0,100]
  const clamped = Math.max(0, Math.min(progress, 100))

  return (
    <Card
      // clsx always returns a string, never undefined
      className={clsx(
        styles.card,
        isUnlocked ? styles.unlocked : styles.locked,
      )}
      elevated
      bordered
    >
      <CardContent className={styles.content ?? ""}>
        {/* Optional icon */}
        {icon && (
          <img src={icon} alt={`${title} icon`} className={styles.icon} />
        )}

        <div className={styles.info}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>

        {/* Only show progress bar when still locked */}
        {!isUnlocked && (
          <div
            className={styles.progressContainer}
            role="progressbar"
            aria-label={`${title} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
            tabIndex={0}
          >
            <div
              className={styles.progressBar}
              style={{ width: `${clamped}%` }}
              aria-hidden="true"
            />
          </div>
        )}

        <div className={styles.status} role="status" aria-live="polite">
          {isUnlocked ? "Unlocked" : `${clamped}% Complete`}
        </div>
      </CardContent>
    </Card>
  )
}

export default AchievementCard
