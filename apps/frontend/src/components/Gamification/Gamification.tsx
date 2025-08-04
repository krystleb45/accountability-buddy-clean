"use client"

import React, { useEffect, useState } from "react"

import type { BadgeData, UserProgress } from "@/types/Gamification.types"

import GamificationService from "@/services/gamificationService"

import BadgeSystem from "../BadgeSystem/BadgeSystem"
import Notification from "../Notifications/Notification"
import ProgressTracker from "../Progress/ProgressTracker"
import styles from "./Gamification.module.css"
import Leaderboard from "./Leaderboard"

interface User {
  id: string
  name: string
}

export interface GamificationProps {
  user: User | null
}

const Gamification: React.FC<GamificationProps> = ({ user }) => {
  const [progress, setProgress] = useState<number>(0)
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [newBadge, setNewBadge] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setError("Please log in to view gamification.")
      setLoading(false)
      return
    }

    const fetchProgress = async (): Promise<void> => {
      setLoading(true)
      setError("")
      try {
        // Use token-based method since service has no fetchUserProgress
        const userProgress: UserProgress | null =
          await GamificationService.fetchUserProgressFromToken()
        if (userProgress) {
          setProgress(userProgress.points ?? 0)
          setBadges(userProgress.badges ?? [])
          if (userProgress.newBadge?.name) {
            setNewBadge(userProgress.newBadge.name)
          }
        }
      } catch (err) {
        console.error("Failed to fetch user progress:", err)
        setError("Failed to load progress. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user])

  if (!user) {
    return (
      <p className={styles.error}>
        Please log in to view gamification details.
      </p>
    )
  }

  return (
    <div className={styles.container} data-testid="gamification-container">
      <h2 className={styles.header}>Gamification</h2>
      {loading ? (
        <p className={styles.loading} data-testid="loading-message">
          Loading...
        </p>
      ) : error ? (
        <p className={styles.error} data-testid="error-message">
          {error}
        </p>
      ) : (
        <>
          <section className={styles.section}>
            <ProgressTracker progress={progress} />
          </section>
          <section className={styles.section} data-testid="achievement-section">
            <BadgeSystem user={user} badges={badges} />
          </section>
          <section className={styles.section}>
            <Leaderboard userId={user.id} />
          </section>
        </>
      )}
      {newBadge && (
        <Notification
          message={`Congratulations! You've earned the ${newBadge} badge!`}
          data-testid="new-badge-notification"
        />
      )}
    </div>
  )
}

export default Gamification
