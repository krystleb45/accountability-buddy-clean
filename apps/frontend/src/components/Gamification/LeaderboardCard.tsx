"use client"
import { Medal, Trophy, User as UserIcon } from "lucide-react"
import Image from "next/image"
import React from "react"

import type { LeaderboardEntry } from "@/types/Gamification.types"

import styles from "./LeaderboardCard.module.css"

interface LeaderboardCardProps {
  user: LeaderboardEntry
  index: number
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ user }) => {
  // Removed unused index parameter
  const { rank, displayName, avatarUrl, score } = user

  const renderIcon = () => {
    if (rank === 1) return <Trophy aria-hidden />
    if (rank === 2) return <Medal aria-hidden className={styles.silver} />
    if (rank === 3) return <Medal aria-hidden className={styles.bronze} />
    return <Medal aria-hidden className={styles.defaultMedal} />
  }

  return (
    <article className={styles.card} role="listitem">
      <div className={styles.rank}>
        <span className={styles.rankNumber}>{rank}.</span>
        <span className={styles.rankIcon}>{renderIcon()}</span>
      </div>

      <div className={styles.userInfo}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${displayName}'s avatar`}
            width={48}
            height={48}
            className={styles.avatar}
          />
        ) : (
          <UserIcon className={styles.avatarFallback} aria-hidden />
        )}
        <span className={styles.username}>{displayName}</span>
      </div>

      <div className="text-lg font-bold text-green-400">🎯 {score}</div>
    </article>
  )
}

export default LeaderboardCard
