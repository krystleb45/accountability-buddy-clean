"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

import { fetchActivities } from "@/api/activity/activity-api"
import { fetchUserBadges } from "@/api/badge/badge-api"
import { fetchDashboardStats } from "@/api/dashboard/dashboard-api"
import { fetchDashboardProgress } from "@/api/progress/progress-api"
import Dashboard from "@/components/Dashboard/Dashboard"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/context/auth/auth-context"

import { fetchUserStreak } from "../../../api/goal/goal-api"

export default function DashboardClient() {
  const { status } = useSession()
  const { user } = useAuth()

  const {
    data: rawStreak,
    isPending: isLoadingStreak,
    error: streakError,
  } = useQuery({
    queryKey: ["raw-streak"],
    queryFn: fetchUserStreak,
  })

  const {
    data: progressData,
    isPending: isLoadingProgress,
    error: progressError,
  } = useQuery({
    queryKey: ["dashboard-progress"],
    queryFn: fetchDashboardProgress,
  })

  const {
    data: stats,
    isPending: isLoadingDashboardStats,
    error: dashboardStatsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  })

  const {
    data: recentActivities,
    isPending: isLoadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ["activities", { page: 1, limit: 5 }],
    queryFn: () =>
      fetchActivities({
        page: 1,
        limit: 5,
      }),
  })

  const {
    data: userBadges,
    isPending: isLoadingBadges,
    error: badgesError,
  } = useQuery({
    queryKey: ["badges"],
    queryFn: fetchUserBadges,
  })

  const loading = useMemo(
    () =>
      isLoadingStreak ||
      isLoadingProgress ||
      isLoadingDashboardStats ||
      isLoadingActivities ||
      isLoadingBadges ||
      status === "loading",
    [
      isLoadingStreak,
      isLoadingProgress,
      isLoadingDashboardStats,
      isLoadingActivities,
      isLoadingBadges,
      status,
    ],
  )

  const error = useMemo(
    () =>
      streakError ||
      progressError ||
      dashboardStatsError ||
      activitiesError ||
      badgesError,
    [
      streakError,
      progressError,
      dashboardStatsError,
      activitiesError,
      badgesError,
    ],
  )

  useEffect(() => {
    if (!error) {
      return
    }

    toast.error(error.message, {
      duration: 5000,
    })
  }, [error])

  // loading / redirect state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return !error &&
    !!stats &&
    !!progressData &&
    !!rawStreak &&
    !!recentActivities &&
    !!userBadges ? (
    <div className="mx-auto max-w-7xl p-6">
      <Dashboard
        userName={user?.name || user?.username || ""}
        userStats={{
          totalGoals: stats.totalGoals,
          completedGoals: stats.completedGoals,
          collaborations: stats.collaborations,
          completionRate: stats.completionRate,
        }}
        streakData={rawStreak}
        userProgress={progressData}
        recentActivities={recentActivities.activities}
        userBadges={userBadges}
      />
    </div>
  ) : null
}
