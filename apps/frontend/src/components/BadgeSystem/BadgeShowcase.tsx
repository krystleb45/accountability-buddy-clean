// src/components/BadgeSystem/BadgeShowcase.tsx
"use client"

import type { FC } from "react"

import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"
import { Tooltip } from "react-tooltip"

import { http } from "@/utils/http"

import styles from "./BadgeSystem.module.css"

export interface Badge {
  _id: string
  badgeType: string
  level: "Bronze" | "Silver" | "Gold"
  icon?: string
  description?: string
}

export interface BadgeShowcaseProps {
  // (no props right now, but you could accept userId, etc.)
}

const BadgeShowcase: FC<BadgeShowcaseProps> = () => {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchShowcase(): Promise<void> {
      setLoading(true)
      setError(null)

      try {
        // 1) Build an AxiosRequestConfig object
        const config: Parameters<typeof http.get>[1] = {}

        // 2) Only add headers if we actually have a token
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("authToken")
          if (token) {
            config.headers = { Authorization: `Bearer ${token}` }
          }
        }

        // 3) Call your endpoint (adjust path & response shape as needed)
        const response = await http.get<{
          success: boolean
          data: { showcasedBadges: Badge[] }
        }>("/badges/showcase", config)

        if (!isMounted) return

        if (response.data.success) {
          setBadges(response.data.data.showcasedBadges)
        } else {
          setBadges([])
        }
      } catch (err) {
        console.error("BadgeShowcase fetch error:", err)
        if (isMounted) {
          setError("Failed to load badge showcase.")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchShowcase()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <p className="text-gray-400">Loading badge showcase…</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (badges.length === 0) {
    return <p className="text-gray-400">No showcased badges yet.</p>
  }

  return (
    <section aria-labelledby="badge-showcase-title" className="mt-8">
      <h2
        id="badge-showcase-title"
        className="mb-4 text-xl font-bold text-green-400"
      >
        🎖️ Badge Showcase
      </h2>

      <div className={styles.badgeList}>
        {badges.map((badge) => (
          <motion.div
            key={badge._id}
            whileHover={{ scale: 1.05 }}
            className={`${styles.badgeItem} ${styles.showcaseBadge}`}
            role="group"
            aria-describedby={`badge-desc-${badge._id}`}
          >
            <div className={styles.pinnedIcon} aria-hidden="true">
              📌
            </div>

            <img
              src={badge.icon ?? "/placeholder-badge.png"}
              alt={badge.badgeType.replace(/_/g, " ")}
              className={styles.badgeImage}
              data-tooltip-id={badge._id}
              data-tooltip-content={badge.description ?? "No description."}
            />

            <Tooltip id={badge._id} />

            <div className={styles.badgeDetails}>
              <p className={styles.badgeName}>
                {badge.badgeType.replace(/_/g, " ")}
              </p>
              <span
                className={
                  badge.level === "Gold"
                    ? "text-xs font-semibold text-yellow-400"
                    : badge.level === "Silver"
                      ? "text-xs font-semibold text-gray-300"
                      : "text-xs font-semibold text-orange-500"
                }
              >
                {badge.level}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default BadgeShowcase
