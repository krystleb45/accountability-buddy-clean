// src/components/Activities/RelatedActivities.tsx
"use client"

import type { ReactElement } from "react"

import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"

import type { RelatedActivity } from "@/types/Activity.types"

import { http } from "@/utils/http"

import styles from "./Activities.module.css"

export interface RelatedActivitiesProps {
  userId: string
}

export default function RelatedActivities({
  userId,
}: RelatedActivitiesProps): ReactElement {
  const [activities, setActivities] = useState<RelatedActivity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    http
      .get<{ data: RelatedActivity[] }>("/activity/related", {
        params: { userId },
      })
      .then(({ data }) => {
        if (isMounted) {
          setActivities(data.data || [])
        }
      })
      .catch((err) => {
        console.error("Failed to load related activities:", err)
        if (isMounted) {
          setError("Failed to load related activities")
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
      className={styles.relatedActivities}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-kelly-green">Related Activities</h3>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && activities.length === 0 && (
        <p className={styles.noActivity}>No related activities</p>
      )}

      {!loading && !error && activities.length > 0 && (
        <ul className={styles.activityList}>
          {activities.map(({ _id, title, link }) => (
            <li key={_id} className={styles.activityItem}>
              <a
                href={link}
                className={styles.activityLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
