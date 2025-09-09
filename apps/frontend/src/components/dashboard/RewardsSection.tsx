"use client"

import Image from "next/image"
import React, { useEffect, useState } from "react"

import GamificationService from "@/services/gamificationService"

import styles from "./RewardsSection.module.css"

/**
 * UI-friendly reward structure derived from raw badge data.
 */
export interface Reward {
  id: string
  name: string
  imageUrl?: string
  description?: string
  points: number
}

/**
 * Raw badge type returned by the GamificationService.
 */
interface RawBadge {
  id: string
  name: string
  icon?: string
  description?: string
  pointsCost?: number
}

/**
 * RewardsSection displays a grid of available rewards fetched from the service.
 */
const RewardsSection: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRewards = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        // Fetch badges using the correct method name
        const rawBadges: RawBadge[] = await GamificationService.fetchBadges()
        const formatted: Reward[] = rawBadges.map((r) => {
          const reward: Reward = {
            id: r.id,
            name: r.name,
            points: r.pointsCost ?? 0,
          }
          if (r.icon) reward.imageUrl = r.icon
          if (r.description) reward.description = r.description
          return reward
        })
        setRewards(formatted)
      } catch (err) {
        console.error("Error loading rewards:", err)
        setError("Failed to load rewards.")
      } finally {
        setLoading(false)
      }
    }
    loadRewards()
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingContainer} aria-busy="true">
        <p className={styles.loadingText}>Loading rewards...</p>
      </div>
    )
  }

  if (error) {
    return <p className={styles.errorText}>{error}</p>
  }

  return (
    <section
      className={styles.rewardsContainer}
      aria-labelledby="rewards-section-title"
    >
      <h2 id="rewards-section-title" className={styles.sectionTitle}>
        🎁 Available Rewards
      </h2>
      {rewards.length > 0 ? (
        <div className={styles.rewardsGrid}>
          {rewards.map((reward) => (
            <div key={reward.id} className={styles.rewardCard}>
              {reward.imageUrl && (
                <Image
                  src={reward.imageUrl}
                  alt={reward.name}
                  width={64}
                  height={64}
                  className={styles.rewardIcon}
                />
              )}
              <h3 className={styles.rewardName}>{reward.name}</h3>
              <p className={styles.rewardPoints}>
                🪙 {reward.points.toLocaleString()} pts
              </p>
              {reward.description && (
                <p className={styles.rewardDescription}>{reward.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noRewardsText}>
          No rewards available at this time.
        </p>
      )}
    </section>
  )
}

export default RewardsSection
