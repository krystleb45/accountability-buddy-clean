'use client'

import React, { useEffect, useState } from 'react'
import RewardCard from '@/components/PointShop/RewardCard'
import {
  fetchRewards,
  redeemReward,
  type Reward,
} from '@/api/reward/rewardApi'
import { getUserPoints } from '@/api/users/userApi'

export default function PointShopClient() {
  const [userPoints, setUserPoints] = useState<number>(0)
  const [rewards, setRewards]     = useState<Reward[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      try {
        const [pts, allRewards] = await Promise.all([
          getUserPoints(),
          fetchRewards(),
        ])
        setUserPoints(pts)
        setRewards(allRewards)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Failed to load data.')
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  const handleRedeem = async (id: string, cost: number) => {
    setLoading(true)
    setError(null)
    try {
      await redeemReward(id)
      setUserPoints((p) => p - cost)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Redeem failed.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="p-6 text-center">Loading…</p>
  if (error)   return <p className="p-6 text-center text-red-500">{error}</p>

  return (
    <div className="point-shop min-h-screen bg-black p-6 text-white">
      <h1 className="mb-4 text-3xl font-bold text-kelly-green">Point Shop</h1>
      <p className="mb-6">
        Your points balance: <strong>{userPoints}</strong>
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => (
          <RewardCard
            key={r.id}
            reward={{
              id: r.id,
              title: r.title,
              pointsRequired: r.pointsRequired,
              ...(r.imageUrl ? { imageUrl: r.imageUrl } : {}),
            }}
            onRedeem={() => handleRedeem(r.id, r.pointsRequired)}
            disabled={userPoints < r.pointsRequired}
          />
        ))}
      </div>
    </div>
  )
}
