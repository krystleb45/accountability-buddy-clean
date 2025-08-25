// src/app/challenge/client.tsx
"use client"

import { addDays, isBefore } from "date-fns"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"

import type { Challenge as APIChallenge } from "@/api/challenge/challengeApi"

import {
  fetchPublicChallenges,
  joinChallenge,
  leaveChallenge,
} from "@/api/challenge/challengeApi"
import ChallengeCard from "@/components/Challenges/ChallengeCard"
import { Skeleton } from "@/components/UtilityComponents/SkeletonComponent"

// 🔍 Filter type
type FilterType = "all" | "weekly" | "monthly"

export default function ClientChallenges() {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ""

  const [challenges, setChallenges] = useState<APIChallenge[]>([])
  const [filtered, setFiltered] = useState<APIChallenge[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())

  // Load public challenges
  useEffect(() => {
    fetchPublicChallenges()
      .then((list) => {
        setChallenges(list)
        if (userId) {
          const joined = list
            .filter((c) => c.participants.some((p) => p.user === userId))
            .map((c) => c._id)
          setJoinedIds(new Set(joined))
        }
      })
      .catch(() => setError("Failed to fetch challenges."))
      .finally(() => setLoading(false))
  }, [userId])

  // Apply filter
  useEffect(() => {
    const now = new Date()
    setFiltered(
      challenges.filter((c) => {
        const end = new Date(c.endDate)
        if (filter === "weekly") return isBefore(end, addDays(now, 7))
        if (filter === "monthly") return isBefore(end, addDays(now, 30))
        return true
      }),
    )
  }, [challenges, filter])

  const handleJoin = async (id: string) => {
    if (!userId) {
      toast.error("🚫 You must be logged in to join.")
      return
    }
    try {
      await joinChallenge(id)
      setJoinedIds((s) => new Set(s).add(id))
      toast.success("✅ Successfully joined!")
    } catch {
      toast.error("⚠️ Error joining challenge.")
    }
  }

  const handleLeave = async (id: string) => {
    if (!userId) {
      toast.error("🚫 You must be logged in to leave.")
      return
    }
    try {
      await leaveChallenge(id)
      setJoinedIds((s) => {
        const copy = new Set(s)
        copy.delete(id)
        return copy
      })
      toast.success("👋 You left the challenge.")
    } catch {
      toast.error("⚠️ Error leaving challenge.")
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-lg bg-gray-800" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="mt-6 text-center text-red-500">{error}</p>
  }

  return (
    <div
      className={`
        min-h-screen px-4 py-8
        md:px-10
      `}
    >
      <h1 className="mb-6 text-center text-3xl font-bold text-green-400">
        🛡️ Explore Public Challenges
      </h1>

      <div className="mb-6 flex justify-center gap-4">
        {(["all", "weekly", "monthly"] as FilterType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`
              rounded-md px-4 py-2 text-sm font-medium
              ${
                filter === type
                  ? "bg-green-500 text-white"
                  : `
                    bg-gray-800 text-gray-300
                    hover:bg-gray-700
                  `
              }
            `}
          >
            {type === "all"
              ? "All"
              : type === "weekly"
                ? "This Week"
                : "This Month"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-300">
          No challenges match your filter.
        </p>
      ) : (
        <div className="mx-auto grid max-w-4xl gap-6">
          {filtered.map((c, idx) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ChallengeCard
                challenge={c}
                isJoined={joinedIds.has(c._id)}
                onJoin={() => handleJoin(c._id)}
                onLeave={() => handleLeave(c._id)}
                userId={userId}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
