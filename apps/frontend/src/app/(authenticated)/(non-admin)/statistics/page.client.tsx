// src/app/statistics/page.client.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ChartBar } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { fetchDashboardStats } from "@/api/dashboard/dashboard-api"
import { fetchUserGoalsStreak } from "@/api/goal/goal-api"
import Card, { CardContent } from "@/components/cards/Card"
import cardStyles from "@/components/cards/Card.module.css"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/useSubscription"

export default function StatisticsClient() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isSubscriptionActive } = useSubscription()

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: isSubscriptionActive,
  })

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return
    }
    ;(async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchUserGoalsStreak(), // Removed the session.user.id argument
        ])

        // Safely handle possibly null streak data
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load statistics.")
      } finally {
        setLoading(false)
      }
    })()
  }, [status, session])

  if (loading) {
    return (
      <p className="mt-10 text-center text-gray-400">Loading statistics…</p>
    )
  }
  if (error) {
    return <p className="mt-10 text-center text-red-500">{error}</p>
  }

  if (!stats) {
    return null
  }

  return (
    <main className="flex flex-col items-start gap-6">
      <Button variant="link" size="sm" asChild className="!px-0">
        <Link href="/dashboard">
          <ArrowLeft /> Back to Dashboard
        </Link>
      </Button>

      <h1 className="flex items-center gap-2 text-3xl font-bold">
        <ChartBar size={36} className="text-primary" /> Your Statistics
      </h1>

      <div
        className={`
          grid grid-cols-1 gap-6
          md:grid-cols-2
        `}
      >
        {/* Goal Progress Card */}
        <Card className={cardStyles.card ?? ""}>
          <CardContent>
            <h2 className="text-center text-2xl font-semibold text-green-300">
              🎯 Goal Progress
            </h2>
            <p>Total Goals: {stats.totalGoals}</p>
            <p>Completed Goals: {stats.completedGoals}</p>
            <p>Active Goals: {stats.activeGoals}</p>
            <p>
              Completion Rate: {(stats.completedGoals / stats.totalGoals) * 100}
              %
            </p>
            <Link
              href="/goals"
              className={`
                mt-3 block text-center text-blue-400
                hover:underline
              `}
            >
              View Goals
            </Link>
          </CardContent>
        </Card>

        {/* Streak Tracker Card */}
        {/* <Card className={cardStyles.card ?? ""}>
          <CardContent>
            <h2 className="text-center text-2xl font-semibold text-orange-300">
              🔥 Streak Tracker
            </h2>
            <p>Current Streak: {stats.currentStreak} days</p>
            <p>Longest Streak: {stats.longestStreak} days</p>
            <div
              className={`
                mt-3 h-4 w-full overflow-hidden rounded-lg bg-gray-800
              `}
            >
              <div
                className="h-4 bg-green-500"
                style={{
                  width: stats.longestStreak
                    ? `${(stats.currentStreak / stats.longestStreak) * 100}%`
                    : "0%",
                  transition: "width 0.5s ease-in-out",
                }}
              />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Achievements Section (full width) */}
      {/* <Card
        className={`
          mt-6
          ${cardStyles.card ?? ""}
        `}
      >
        <CardContent>
          <h2 className="text-center text-2xl font-semibold text-yellow-300">
            🏆 Achievements
          </h2>
          {stats.achievements.length > 0 ? (
            <ul className="mt-3 space-y-1 text-center">
              {stats.achievements.map((ach, i) => (
                <li key={i}>🏅 {ach}</li>
              ))}
            </ul>
          ) : (
            <p className="text-center">No achievements yet.</p>
          )}
          <Link
            href="/achievements"
            className={`
              mt-3 block text-center text-blue-400
              hover:underline
            `}
          >
            View All Achievements
          </Link>
        </CardContent>
      </Card> */}

      {/* Collaboration Goals Section */}
      <Card
        className={`
          mt-6
          ${cardStyles.card ?? ""}
        `}
      >
        <CardContent>
          <h2 className="text-center text-2xl font-semibold text-pink-300">
            🤝 Collaboration Goals
          </h2>
          <p className="text-center text-gray-400">
            Track you and your friends' progress together.
          </p>
          <ul className="mt-4 space-y-2">
            <li>
              Your progress: {(stats.completedGoals / stats.totalGoals) * 100}%
            </li>
            <li>Friend A: 80%</li>
            <li>Friend B: 55%</li>
          </ul>
          <Link
            href="/collaborations"
            className={`
              mt-3 block text-center text-blue-400
              hover:underline
            `}
          >
            View Collaborations
          </Link>
        </CardContent>
      </Card>

      {/* Statistics Chart Section (full width) */}
      {/* <Card
        className={`
          mt-6
          ${cardStyles.card ?? ""}
        `}
      >
        <CardContent>
          <UserStatisticsChart
            totalGoals={stats.totalGoals}
            completedGoals={stats.completedGoals}
            collaborations={stats.collaborations}
            goalTrends={stats.goalTrends}
            categoryBreakdown={stats.categoryBreakdown}
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
          />
        </CardContent>
      </Card> */}
    </main>
  )
}
