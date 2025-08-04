"use client"

import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"

import type { DashboardStats } from "@/api/dashboard/dashboardApi"
import type { BadgeData, UserProgress } from "@/types/Gamification.types"

import { fetchDashboardStats } from "@/api/dashboard/dashboardApi"
import Dashboard from "@/components/Dashboard/Dashboard"
import GamificationService from "@/services/gamificationService"

import type { StreakData } from "../../api/goal/goalsApi"

import { fetchUserStreak } from "../../api/goal/goalsApi"

export default function DashboardClient() {
  const { data: session, status } = useSession()
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // once auth is known, bail early if unauthenticated
    if (status !== "loading" && status !== "authenticated") {
      setLoading(false)
      return
    }

    if (status === "authenticated") {
      ;(async () => {
        setLoading(true)
        try {
          // fetchUserStreak() calls /api/goals/streak-dates under the hood
          const [rawStreak, progressData, dashboardStats] = await Promise.all([
            fetchUserStreak(),
            GamificationService.fetchUserProgressFromToken(),
            fetchDashboardStats(),
          ])

          if (!rawStreak || !progressData) {
            throw new Error("Failed to load dashboard data.")
          }

          setStreakData({
            completionDates: rawStreak.completionDates ?? [],
            currentStreak: rawStreak.currentStreak ?? 0,
            longestStreak: rawStreak.longestStreak ?? 0,
            goalProgress: rawStreak.goalProgress ?? 0,
          })
          setUserProgress(progressData)
          setStats(dashboardStats)
          setBadges((progressData.badges ?? []).slice(0, 3))
        } catch (e: any) {
          console.error(e)
          setError(e.message || "Something went wrong.")
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [status])

  // loading / redirect state
  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading dashboard…</p>
      </div>
    )
  }

  // unauthenticated or error
  if (
    status !== "authenticated" ||
    error ||
    !streakData ||
    !userProgress ||
    !stats
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-red-500">
        <p>
          {status !== "authenticated"
            ? "Log in to view your dashboard."
            : error || "Dashboard data is unavailable."}
        </p>
      </div>
    )
  }

  const recentActivities = [
    "✅ Completed 'Workout 5 times a week'",
    "🎯 Joined Productivity Boosters group",
    "🤝 Sent encouragement to a friend",
  ]

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Dashboard
        userName={session?.user.name || ""}
        userStats={{
          totalGoals: stats.totalGoals,
          completedGoals: stats.completedGoals,
          collaborations: stats.collaborations,
        }}
        recentActivities={recentActivities}
        userProgress={userProgress}
        recentBadges={badges}
        points={userProgress.points}
        streakData={streakData}
      />
    </div>
  )
}
