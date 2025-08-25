"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import type { Reward } from "@/api/reward/rewardApi"

import { fetchRewards } from "@/api/reward/rewardApi"
import usePoints from "@/hooks/usePoints"

interface Props {
  rewardId: string
}

export default function RewardDetailPage({ rewardId }: Props) {
  const { userPoints, redeem } = usePoints()
  const [reward, setReward] = useState<Reward | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!rewardId) {
      setError("Invalid reward ID.")
      setLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      try {
        const all = await fetchRewards()
        const r = all.find((x) => x.id === rewardId)
        if (!r) throw new Error("Reward not found.")
        setReward(r)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to fetch reward.")
      } finally {
        setLoading(false)
      }
    })()
  }, [rewardId])

  if (loading) return <p className="mt-10 text-center">Loading reward…</p>
  if (error) return <p className="mt-10 text-center text-red-500">{error}</p>
  if (!reward) {
    // In case metadata was wrong
    router.replace("/point-shop")
    return null
  }

  const canRedeem = userPoints >= reward.pointsRequired

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <h1 className="mb-4 text-3xl font-bold">{reward.title}</h1>
      <p className="mb-4">{reward.description}</p>
      <p className="mb-6">
        Points required: <strong>{reward.pointsRequired}</strong>
      </p>
      <button
        type="button"
        onClick={() => redeem(reward.id, reward.pointsRequired)}
        disabled={!canRedeem}
        className={`
          rounded-lg px-6 py-3 text-white
          ${canRedeem ? `bg-primary/80` : "cursor-not-allowed bg-gray-700"}
        `}
      >
        {canRedeem ? "Redeem Now" : "Not enough points"}
      </button>
    </div>
  )
}
