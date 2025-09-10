"use client"

import { useQuery } from "@tanstack/react-query"
import { XCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useMemo } from "react"

import { fetchActivities } from "@/api/activity/activity-api"
import { fetchUserBadges } from "@/api/badge/badge-api"
import { fetchDashboardStats } from "@/api/dashboard/dashboard-api"
import { fetchUserStreak } from "@/api/goal/goal-api"
import { fetchDashboardProgress } from "@/api/progress/progress-api"
import { Dashboard } from "@/components/dashboard/dashboard"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/context/auth/auth-context"
import { useSubscription } from "@/hooks/useSubscription"

export default function DashboardClient() {
  const { status } = useSession()
  const { user } = useAuth()

  const { isSubscriptionActive } = useSubscription()

  const {
    data: rawStreak,
    isPending: isLoadingStreak,
    error: streakError,
  } = useQuery({
    queryKey: ["raw-streak"],
    queryFn: fetchUserStreak,
    enabled: isSubscriptionActive,
  })

  const {
    data: progressData,
    isPending: isLoadingProgress,
    error: progressError,
  } = useQuery({
    queryKey: ["dashboard-progress"],
    queryFn: fetchDashboardProgress,
    enabled: isSubscriptionActive,
  })

  const {
    data: stats,
    isPending: isLoadingDashboardStats,
    error: dashboardStatsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: isSubscriptionActive,
  })

  const {
    data: recentActivities,
    isPending: isLoadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ["activities", { page: 1, limit: 3 }],
    queryFn: () =>
      fetchActivities({
        page: 1,
        limit: 3,
      }),
    enabled: isSubscriptionActive,
  })

  const {
    data: userBadges,
    isPending: isLoadingBadges,
    error: badgesError,
  } = useQuery({
    queryKey: ["badges"],
    queryFn: fetchUserBadges,
    enabled: isSubscriptionActive,
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

  // loading / redirect state
  if (loading && isSubscriptionActive) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading your details.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </main>
    )
  }

  return !error &&
    !!stats &&
    !!progressData &&
    !!rawStreak &&
    !!recentActivities &&
    !!userBadges ? (
    <div>
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
