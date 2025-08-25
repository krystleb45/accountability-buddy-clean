// src/components/Profile/StreakReminder.tsx
"use client"

import { BellRing } from "lucide-react"
import { motion } from "motion/react"
import React, { useEffect, useState } from "react"

import styles from "./StreakReminder.module.css"

interface StreakReminderProps {
  /** ISO date string of the last time a goal was completed */
  lastGoalCompletedAt?: string
  /** Number of consecutive days the user has completed at least one goal */
  currentStreak: number
}

/**
 * If the user hasn't completed a goal today, show a gentle nudge
 * to keep their streak alive.
 */
const StreakReminder: React.FC<StreakReminderProps> = ({
  lastGoalCompletedAt,
  currentStreak,
}) => {
  const [showReminder, setShowReminder] = useState<boolean>(false)

  useEffect((): void => {
    const today = new Date().toDateString()
    const lastCompleted = lastGoalCompletedAt
      ? new Date(lastGoalCompletedAt).toDateString()
      : ""

    setShowReminder(lastCompleted !== today)
  }, [lastGoalCompletedAt])

  if (!showReminder) {
    return null
  }

  return (
    <motion.div
      className={styles.streakReminder}
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BellRing className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        <h3 className={styles.title}>Keep Your Streak Alive!</h3>
        <p className={styles.message}>
          You haven’t completed a goal today. Complete one now to maintain your{" "}
          <strong>{currentStreak}-day streak</strong>! ⚡
        </p>
      </div>
    </motion.div>
  )
}

export default StreakReminder
