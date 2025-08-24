"use client"

import type { ReactElement } from "react"

import { motion } from "motion/react"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"

import { fetchActivityById } from "@/api/activity/activity-api"

interface Activity {
  _id: string
  title: string
  description?: string
  createdAt: string
  status?: "completed" | "in-progress" | "pending"
}

export default function ActivityDetails(): ReactElement {
  // Next.js’s `useParams` can return string | string[] | undefined
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : undefined

  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Invalid activity ID.")
      setLoading(false)
      return
    }

    const loadActivity = async (): Promise<void> => {
      try {
        setLoading(true)
        const data = await fetchActivityById(id)
        setActivity(data)
      } catch {
        setError("Failed to load activity details.")
      } finally {
        setLoading(false)
      }
    }

    loadActivity()
  }, [id])

  if (loading) {
    return (
      <p className="text-center text-gray-400">Loading activity details…</p>
    )
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (!activity) {
    return <p className="text-center text-gray-400">No activity found.</p>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        mx-auto max-w-2xl rounded-lg bg-gray-900 p-6 text-white shadow-lg
      `}
    >
      <h2 className="text-kelly-green text-2xl font-bold">{activity.title}</h2>
      <p className="text-gray-400">
        {activity.description ?? "No description provided."}
      </p>
      <p className="text-sm text-gray-500">
        Created: {new Date(activity.createdAt).toLocaleDateString()}
      </p>
      <p
        className={[
          "mt-2 rounded-lg px-3 py-1 text-sm font-medium text-black",
          activity.status === "completed"
            ? "bg-green-500"
            : activity.status === "in-progress"
              ? "bg-yellow-500"
              : "bg-red-500",
        ].join(" ")}
      >
        Status: {activity.status}
      </p>
    </motion.div>
  )
}
