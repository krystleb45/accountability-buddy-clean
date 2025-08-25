"use client"

import React, { useEffect, useState } from "react"

import type { Achievement } from "@/api/achievements/achievementsApi"

import { fetchUserAchievements } from "@/api/achievements/achievementsApi"
import AchievementCard from "@/components/Progress/AchievementCard"

const AchievementsClient: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const items = await fetchUserAchievements()
        setAchievements(items)
      } catch (err) {
        console.error("Error fetching achievements:", err)
        setError("Failed to load achievements. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <h1
        id="achievements-title"
        className="mb-6 text-center text-3xl font-bold text-yellow-400"
      >
        🏆 Your Achievements
      </h1>

      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="animate-pulse text-center text-gray-400"
        >
          Fetching your achievements...
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="text-center text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section
          aria-labelledby="achievements-title"
          className={`
            grid grid-cols-1 gap-6
            md:grid-cols-2
            lg:grid-cols-3
          `}
        >
          {achievements.length > 0 ? (
            achievements.map((ach) => <AchievementCard key={ach.id} {...ach} />)
          ) : (
            <div className="col-span-full text-center text-gray-300">
              No achievements yet. Start completing goals to earn achievements!
              🚀
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default AchievementsClient
