// src/components/Gamification/Leaderboard.tsx
"use client"

import React, { useCallback, useEffect, useState } from "react"

import type { LeaderboardEntry } from "@/types/Gamification.types"

import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner"
import { getAvatarUrl } from "@/utils/avatarUtils"
import { http } from "@/utils/http"

import styles from "./LeaderboardCard.module.css"

interface LeaderboardProps {
  userId: string
  entries?: LeaderboardEntry[]
  type?: "global" | "challenge"
  challengeId?: string
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  userId,
  entries,
  type = "global",
  challengeId,
}) => {
  // Initialize
  const defaultEntries = entries ?? []
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(defaultEntries)
  const [loading, setLoading] = useState<boolean>(defaultEntries.length === 0)
  const [error, setError] = useState<string>("")
  const [sortBy, setSortBy] = useState<
    "points" | "completedGoals" | "streakCount"
  >("points")
  const [timeRange, setTimeRange] = useState<"all" | "weekly" | "monthly">(
    "all",
  )

  // Fetch leaderboard from API
  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const resp = await http.get<LeaderboardEntry[]>("/leaderboard", {
        params: { sortBy, timeRange, type, challengeId },
      })
      setLeaderboard(resp.data)
    } catch (err) {
      console.error("❌ [Leaderboard] fetch error:", err)
      setError("Failed to load leaderboard. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [sortBy, timeRange, type, challengeId])

  // on mount or when controls change
  useEffect(() => {
    if (entries && entries.length > 0) {
      setLeaderboard(entries)
      setLoading(false)
    } else {
      loadLeaderboard()
    }
  }, [entries, loadLeaderboard])

  const renderMedal = (idx: number) =>
    idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1

  return (
    <div className={styles.container} data-testid="leaderboard">
      <h2 className={styles.title}>
        {type === "challenge" ? "Challenge Leaderboard" : "Global Leaderboard"}
      </h2>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="sort-by">Sort By:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="points">XP</option>
            <option value="completedGoals">Goals</option>
            <option value="streakCount">Streaks</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="time-range">Time Range:</label>
          <select
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <button
          className={styles.refreshButton}
          onClick={loadLeaderboard}
          aria-label="Refresh leaderboard"
        >
          🔄 Refresh
        </button>
      </div>

      {loading && <LoadingSpinner size={40} />}

      {error && (
        <div className={styles.error} data-testid="error-message">
          <p>{error}</p>
          <button onClick={loadLeaderboard}>Retry</button>
        </div>
      )}

      {!loading && !error && leaderboard.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Avatar</th>
              <th>Name</th>
              <th>Score</th>
              {type === "challenge" && <th>Milestone</th>}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr
                key={entry.userId}
                className={entry.userId === userId ? styles.currentUser : ""}
              >
                <td className={styles.rank}>{renderMedal(idx)}</td>
                <td>
                  <img
                    src={entry.avatarUrl || getAvatarUrl(entry)}
                    alt={entry.displayName}
                    className={styles.avatar}
                  />
                </td>
                <td>{entry.displayName}</td>
                <td className={styles.score}>{entry.score}</td>
                {type === "challenge" && (
                  <td>{entry.metadata?.milestone ?? "—"}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading &&
        !error && (
          <p className={styles.noData} data-testid="no-data-message">
            No leaderboard data available.
          </p>
        )
      )}
    </div>
  )
}

export default Leaderboard
