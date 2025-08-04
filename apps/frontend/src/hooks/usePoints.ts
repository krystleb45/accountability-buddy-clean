// src/hooks/usePoints.ts
"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { Reward as APIReward } from "@/api/reward/rewardApi"
import type { Reward } from "@/types/Rewards.types"

import { fetchRewards, redeemReward } from "@/api/reward/rewardApi"
import { useAPI } from "@/context/data/APIContext"

interface PointsData {
  points: number
}

interface UsePointsReturn {
  userPoints: number
  rewards: Reward[]
  loading: boolean
  error: string | null
  redeem: (rewardId: string, cost: number) => Promise<void>
  refresh: () => Promise<void>
}

export default function usePoints(): UsePointsReturn {
  const { callAPI } = useAPI()
  const [userPoints, setUserPoints] = useState(0)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep a stable ref to avoid re-creating the load fn on every render
  const loadRef = useRef<(() => Promise<void>) | undefined>(undefined)

  const load = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      // 1) fetch user points
      const pd = await callAPI<PointsData>({
        method: "get",
        url: "/user/points",
      })
      if (pd) setUserPoints(pd.points)

      // 2) fetch rewards
      const apiRewards: APIReward[] = await fetchRewards()

      // 3) normalize into our UI Reward type
      const uiRewards: Reward[] = apiRewards.map((r) => ({
        id: r._id, // ← map into `id`, not `_id`
        title: r.title,
        description: r.description ?? "",
        pointsRequired: r.pointsRequired,
        imageUrl: r.imageUrl ?? "",
      }))
      setRewards(uiRewards)
    } catch (err) {
      console.error("usePoints.load error:", err)
      setError("Failed to load points or rewards.")
    } finally {
      setLoading(false)
    }
  }, [callAPI])

  // wire up the ref
  loadRef.current = load

  // initial load
  useEffect(() => {
    loadRef.current!()
  }, [])

  // redeem handler
  const redeem = useCallback(async (rewardId: string, cost: number) => {
    setLoading(true)
    setError(null)
    try {
      await redeemReward(rewardId)
      setUserPoints((prev) => prev - cost)
    } catch (err) {
      console.error("usePoints.redeem error:", err)
      setError("Failed to redeem reward.")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    userPoints,
    rewards,
    loading,
    error,
    redeem,
    refresh: load,
  }
}
