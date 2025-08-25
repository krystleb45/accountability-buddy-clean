// src/app/admin-reward/client.tsx
"use client"

import Image from "next/image"
import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"

import type { AdminReward } from "@/api/admin/rewardApi"

import {
  createAdminReward,
  deleteAdminReward,
  fetchAdminRewards,
} from "@/api/admin/rewardApi"

interface NewReward {
  name: string
  description: string
  imageUrl: string
  points: number
}

export default function ClientAdminRewards(): React.ReactElement {
  const [rewards, setRewards] = useState<AdminReward[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [newReward, setNewReward] = useState<NewReward>({
    name: "",
    description: "",
    imageUrl: "",
    points: 0,
  })

  /** load all rewards */
  const load = async (): Promise<void> => {
    try {
      const list = await fetchAdminRewards()
      setRewards(list)
    } catch {
      toast.error("Failed to load rewards.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  /** add one */
  const handleAdd = async (): Promise<void> => {
    const { name, points, description, imageUrl } = newReward
    if (!name.trim() || points <= 0) {
      toast.error("Name and positive points are required.")
      return
    }
    try {
      const created = await createAdminReward({
        name,
        description,
        imageUrl,
        points,
      })
      if (created) {
        setRewards((prev) => [...prev, created])
        toast.success("✅ Reward added!")
        setNewReward({ name: "", description: "", imageUrl: "", points: 0 })
      } else {
        toast.error("Failed to create reward - no data returned.")
      }
    } catch {
      toast.error("Failed to add reward.")
    }
  }

  /** delete one */
  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteAdminReward(id)
      setRewards((prev) => prev.filter((r) => r._id !== id))
      toast.success("Reward deleted.")
    } catch {
      toast.error("Failed to delete reward.")
    }
  }

  const onChange = (field: keyof NewReward, value: string | number): void => {
    setNewReward((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-green-400">
          🎁 Admin Reward Management
        </h1>

        {/* Add Reward Form */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">➕ Add New Reward</h2>
          <div
            className={`
              grid gap-4
              md:grid-cols-2
            `}
          >
            <input
              className="rounded bg-gray-700 p-2 text-white"
              placeholder="Reward Name"
              value={newReward.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
            <input
              className="rounded bg-gray-700 p-2 text-white"
              placeholder="Image URL"
              value={newReward.imageUrl}
              onChange={(e) => onChange("imageUrl", e.target.value)}
            />
            <input
              className="rounded bg-gray-700 p-2 text-white"
              placeholder="Points"
              type="number"
              value={newReward.points}
              onChange={(e) =>
                onChange("points", Number.parseInt(e.target.value, 10) || 0)
              }
            />
            <textarea
              className="rounded bg-gray-700 p-2 text-white"
              placeholder="Description"
              rows={3}
              value={newReward.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            className={`
              mt-4 rounded bg-green-600 px-4 py-2 transition
              hover:bg-green-500
            `}
          >
            Add Reward
          </button>
        </div>

        {/* Rewards List */}
        {loading ? (
          <p>Loading rewards...</p>
        ) : rewards.length === 0 ? (
          <p>No rewards found.</p>
        ) : (
          <div
            className={`
              grid gap-6
              sm:grid-cols-2
              md:grid-cols-3
            `}
          >
            {rewards.map((reward) => (
              <div
                key={reward._id}
                className={`
                  relative rounded-lg border border-gray-700 bg-gray-800 p-4
                  shadow
                `}
              >
                {reward.imageUrl && (
                  <Image
                    src={reward.imageUrl}
                    alt={reward.name}
                    width={100}
                    height={100}
                    className="mx-auto mb-2 size-24 rounded object-contain"
                  />
                )}
                <h3 className="text-center text-lg font-semibold text-green-400">
                  {reward.name}
                </h3>
                <p className="text-center text-sm text-gray-300">
                  {reward.description}
                </p>
                <p
                  className={`
                    mt-2 text-center text-sm font-bold text-yellow-400
                  `}
                >
                  🪙 {reward.points} pts
                </p>
                <button
                  onClick={() => handleDelete(reward._id)}
                  className={`
                    mx-auto mt-2 block text-sm text-red-500
                    hover:underline
                  `}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
