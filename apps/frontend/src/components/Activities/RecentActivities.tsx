// src/components/Activities/RecentActivities.tsx
"use client"

import type { ReactElement } from "react"

import { motion } from "motion/react"
import React, { useEffect, useState } from "react"

import type { RecentActivity } from "@/types/Activity.types"

import { http } from "@/lib/http" // our central axios instance

import styles from "./Activities.module.css"

export interface RecentActivitiesProps {
  userId: string
}

export default function RecentActivities({
  userId,
}: RecentActivitiesProps): ReactElement {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    http
      .get<{ data: RecentActivity[] }>("/activity", { params: { userId } })
      .then(({ data }) => {
        if (isMounted) {
          setActivities(data.data || [])
        }
      })
      .catch((err) => {
        console.error("Failed to load recent activities:", err)
        if (isMounted) {
          setError("Failed to load recent activities")
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [userId])

  return (
    <motion.div
      className={styles.recentActivities}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-kelly-green">Recent Activities</h3>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && activities.length === 0 && (
        <p className={styles.noActivity}>No recent activities</p>
      )}

      {!loading && !error && activities.length > 0 && (
        <ul className={styles.activityList}>
          {activities.map(({ _id, activityType, details, createdAt }) => (
            <li key={_id} className={styles.activityItem}>
              <p>
                <strong>{activityType}</strong>: {details}
              </p>
              <span className={styles.timestamp}>
                {new Date(createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
