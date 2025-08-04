"use client"

import React, { useEffect, useState } from "react"

import type { Reward as ApiReward } from "../../api/reward/rewardApi"
import type { Reward as UiReward } from "../../types/Rewards.types"

import {
  fetchRewards as apiFetchRewards,
  redeemReward,
} from "../../api/reward/rewardApi"
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner"
import styles from "./PointShop.module.css"
import RewardCard from "./RewardCard"

const PointShop: React.FC = () => {
  const [userPoints, setUserPoints] = useState<number>(0)
  const [rewards, setRewards] = useState<UiReward[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect((): void => {
    const loadData = async (): Promise<void> => {
      setLoading(true)
      setError("")
      try {
        // 1) Fetch user points
        const resp = await fetch("/api/user/points")
        const { points }: { points: number } = await resp.json()
        setUserPoints(points)

        // 2) Fetch API rewards
        const apiRewards: ApiReward[] = await apiFetchRewards()

        // 3) Map ApiReward → UiReward
        // … inside your useEffect mapping:

        const uiRewards: UiReward[] = apiRewards.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description ?? "",
          pointsRequired: r.pointsRequired,
          imageUrl: r.imageUrl ?? "",
        }))

        setRewards(uiRewards)
      } catch (err) {
        console.error("Error loading point shop data:", err)
        setError("Unable to load shop data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  const handleRedeem = async (
    rewardId: string,
    cost: number,
  ): Promise<void> => {
    try {
      await redeemReward(rewardId)
      setUserPoints((prev) => prev - cost)
    } catch (err) {
      console.error("Error redeeming reward:", err)
      setError("Failed to redeem reward. Please try again.")
    }
  }

  return (
    <section className={styles.container} aria-labelledby="pointshop-heading">
      <h2 id="pointshop-heading" className={styles.heading}>
        Point Shop
      </h2>

      {loading ? (
        <div className={styles.spinner}>
          <LoadingSpinner size={40} />
        </div>
      ) : error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <>
          <div className={styles.balance}>
            Your Points: <span className={styles.points}>{userPoints}</span>
          </div>

          {rewards.length === 0 ? (
            <p className={styles.empty}>No rewards available at the moment.</p>
          ) : (
            <div className={styles.grid}>
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onRedeem={() =>
                    handleRedeem(reward.id, reward.pointsRequired)
                  }
                  disabled={userPoints < reward.pointsRequired}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default PointShop
