// src/context/PointContext.tsx
"use client"

import type { ReactNode } from "react"

import React, { createContext, use, useEffect, useState } from "react"

import type { Reward as UIReward } from "../types/Rewards.types"

import {
  fetchRewards as fetchApiRewards,
  redeemReward,
} from "../api/reward/rewardApi"

interface PointContextType {
  userPoints: number
  rewards: UIReward[]
  loading: boolean
  redeem: (rewardId: string, cost: number) => Promise<void>
}

const PointContext = createContext<PointContextType | undefined>(undefined)

export function usePoints(): PointContextType {
  const ctx = use(PointContext)
  if (!ctx) throw new Error("usePoints must be used within a <PointProvider>")
  return ctx
}

export const PointProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userPoints, setUserPoints] = useState<number>(0)
  const [rewards, setRewards] = useState<UIReward[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        // 1) fetch user points
        const ptsRes = await fetch("/api/user/points")
        const { points } = await ptsRes.json()
        setUserPoints(points)

        // 2) fetch all rewards from your backend
        //    (assumed shape: { id, title, description, pointsRequired, imageUrl? }[])
        const apiRewards = await fetchApiRewards()

        // 3) map to your UI Reward interface
        const uiRewards: UIReward[] = apiRewards.map((r) => ({
          id: r.id, // ← map into `id`, not `_id`
          title: r.title,
          description: r.description ?? "",
          pointsRequired: r.pointsRequired,
          imageUrl:
            typeof r.imageUrl === "string" ? r.imageUrl : "/placeholder.png",
        }))

        setRewards(uiRewards)
      } catch (err) {
        console.error("Failed to load points or rewards", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const redeem = async (rewardId: string, cost: number): Promise<void> => {
    try {
      await redeemReward(rewardId)
      setUserPoints((prev) => prev - cost)
    } catch (err) {
      console.error("Redeem failed", err)
    }
  }

  return (
    <PointContext value={{ userPoints, rewards, loading, redeem }}>
      {children}
    </PointContext>
  )
}
