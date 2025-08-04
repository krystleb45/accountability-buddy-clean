// src/app/recent-activities/page.client.tsx
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import type { Activity as ApiActivity } from "@/api/activity/activityApi"

import { fetchActivities } from "@/api/activity/activityApi"

interface ActivityDisplay {
  description: string
  date: string
  type: "completed" | "created"
}

const ActivityItem: React.FC<{ activity: ActivityDisplay }> = ({
  activity,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="mb-2 rounded-lg bg-gray-900 p-4 shadow-md"
  >
    <div className="flex items-center justify-between">
      <p className="text-white">{activity.description}</p>
      <span className="text-sm text-gray-400">{activity.date}</span>
    </div>
    <span
      className={`text-sm ${
        activity.type === "completed" ? "text-green-400" : "text-blue-400"
      }`}
    >
      {activity.type === "completed" ? "✅ Completed" : "🛠 Created"}
    </span>
  </motion.div>
)

const FILTER_TYPES: Array<"all" | "completed" | "created"> = [
  "all",
  "completed",
  "created",
]

export default function RecentActivitiesClient() {
  const [filter, setFilter] = useState<"all" | "completed" | "created">("all")
  const [activities, setActivities] = useState<ActivityDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const fetched: ApiActivity[] = await fetchActivities()
        const formatted = fetched.map<ActivityDisplay>((a) => ({
          description: a.title || "Unnamed activity",
          date: new Date(a.createdAt).toLocaleDateString(),
          type: a.completed ? "completed" : "created", // now TS knows it's ActivityDisplay
        }))
        setActivities(formatted)
      } catch (err: unknown) {
        console.error("Error fetching recent activities:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load recent activities.",
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = activities.filter((act) => {
    if (filter === "completed") return act.type === "completed"
    if (filter === "created") return act.type === "created"
    return true
  })

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6 flex items-center justify-between rounded-lg bg-gray-900 p-6 shadow-md"
      >
        <h1 className="text-3xl font-bold text-green-400">Recent Activities</h1>
        <nav className="flex gap-4">
          <Link href="/dashboard">
            <span className="font-semibold text-green-400 hover:underline">
              Dashboard
            </span>
          </Link>
          <Link href="/profile">
            <span className="font-semibold text-green-400 hover:underline">
              Profile
            </span>
          </Link>
        </nav>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-6 rounded-lg bg-gray-900 p-4 shadow-md"
      >
        <h2 className="mb-2 text-xl font-semibold text-green-400">
          Filter Activities
        </h2>
        <div className="flex gap-4">
          {FILTER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-lg px-4 py-2 transition ${
                filter === type
                  ? "bg-green-500 text-black"
                  : "bg-gray-700 text-white"
              }`}
              aria-pressed={filter === type}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="rounded-lg bg-gray-900 p-6 shadow-md"
      >
        <h2 className="mb-4 text-2xl font-semibold text-green-400">
          Your Recent Activities
        </h2>

        {loading && (
          <p className="text-center text-gray-400">
            Loading recent activities...
          </p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading &&
          !error &&
          (filtered.length > 0 ? (
            filtered.map((act, idx) => (
              <ActivityItem key={idx} activity={act} />
            ))
          ) : (
            <p className="text-center text-gray-400">
              No recent activities to show.
            </p>
          ))}
      </motion.main>

      <footer className="mt-12 text-center text-gray-500">
        &copy; {new Date().getFullYear()} Accountability Buddy. All rights
        reserved.
      </footer>
    </div>
  )
}
