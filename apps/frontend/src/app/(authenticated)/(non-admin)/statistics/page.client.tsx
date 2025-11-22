// src/app/statistics/page.client.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  Activity,
  ArrowLeft,
  BarChart,
  CalendarCheck,
  CalendarDays,
  ChartBar,
  ChartColumn,
  Goal,
  Percent,
  SquareCheckBig,
  Users,
  XCircle,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"

import { getAdvancedAnalytics } from "@/api/analytics/analytics-api"
import { fetchDashboardStats } from "@/api/dashboard/dashboard-api"
import { fetchUserStreak } from "@/api/streaks/streak-api"
import { DashboardStatCard } from "@/components/dashboard"
import { StreakCalendar } from "@/components/gamification/streak-calendar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { useSubscription } from "@/hooks/useSubscription"

import { AdvancedAnalytics } from "./advanced-analytics"

const chartConfig = {
  total: {
    label: "Total Goals",
    color: "var(--chart-5)",
  },
  completed: {
    label: "Completed Goals",
    color: "var(--chart-1)",
  },
  active: {
    label: "Active Goals",
    color: "var(--chart-3)",
  },
  collaborations: {
    label: "Collaborations",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function StatisticsClient() {
  const { isSubscriptionActive, hasAdvancedAnalytics } = useSubscription()

  const {
    data: stats,
    isPending: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: isSubscriptionActive,
  })

  const {
    data: streak,
    isPending: isLoadingStreak,
    error: streakError,
  } = useQuery({
    queryKey: ["streak"],
    queryFn: fetchUserStreak,
    enabled: isSubscriptionActive,
  })

  const {
    data: advancedAnalytics,
    isPending: isLoadingAdvancedAnalytics,
    error: advancedAnalyticsError,
  } = useQuery({
    queryKey: ["advanced-analytics"],
    queryFn: getAdvancedAnalytics,
    enabled: isSubscriptionActive && hasAdvancedAnalytics,
  })

  const loading =
    isLoadingStats ||
    isLoadingStreak ||
    (isLoadingAdvancedAnalytics && hasAdvancedAnalytics)
  const error =
    statsError?.message ||
    streakError?.message ||
    advancedAnalyticsError?.message ||
    null

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </main>
    )
  }
  if (error) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading your stats.</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    )
  }

  if (!stats || !streak) {
    return null
  }

  const chartData = [
    {
      type: "active",
      count: stats.totalGoals - stats.completedGoals,
      fill: "var(--color-active)",
    },
    {
      type: "completed",
      count: stats.completedGoals,
      fill: "var(--color-completed)",
    },
    {
      type: "total",
      count: stats.totalGoals,
      fill: "var(--color-total)",
    },
  ]

  return (
    <main className="flex flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/dashboard">
          <ArrowLeft /> Back to Dashboard
        </Link>
      </Button>

      <h1 className="flex items-center gap-2 text-3xl font-bold">
        <ChartBar size={36} className="text-primary" /> Your Statistics
      </h1>

      {/* Goal Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Goal className="text-primary" /> Goals Progress
          </CardTitle>
          <CardAction>
            <Button variant="outline" asChild>
              <Link href="/goals">View Goals</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent
          className={`
            grid grid-cols-1 gap-4
            md:grid-cols-2
          `}
        >
          <div className="flex flex-col gap-4">
            <div
              className={`
                grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3
              `}
            >
              <DashboardStatCard
                title="Total Goals"
                value={stats.totalGoals}
                icon={<Goal className="text-chart-2" />}
              />
              <DashboardStatCard
                title="Completed Goals"
                value={stats.completedGoals}
                icon={<SquareCheckBig className="text-chart-1" />}
              />
              <DashboardStatCard
                title="Active Goals"
                value={stats.activeGoals}
                icon={<Activity className="text-chart-3" />}
              />
              <DashboardStatCard
                title="Collaboration Goals"
                value={stats.collaborations}
                icon={<Users className="text-chart-2" />}
              />
            </div>
            <Card className="flex-1 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="text-primary" /> Overall Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="mb-2 text-xl font-bold tabular-nums">
                  {stats.completionRate}%
                </p>
                <Progress value={stats.completionRate} max={100} />
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartColumn className="text-primary" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="min-h-[20rem] w-full"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={-90}
                  endAngle={380}
                  innerRadius="30%"
                  outerRadius="110%"
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="type" />}
                  />
                  <RadialBar dataKey="count" background>
                    <LabelList
                      position="insideStart"
                      dataKey="type"
                      className="fill-white capitalize mix-blend-luminosity"
                      fontSize={16}
                    />
                  </RadialBar>
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Streak Tracker Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary" /> Login Streak Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              mb-4 grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3
            `}
          >
            <DashboardStatCard
              title="Current Streak"
              value={`${streak.streakCount ?? 0} day${streak.streakCount === 1 ? "" : "s"}`}
              icon={<Zap className="text-chart-3" />}
            />
            <DashboardStatCard
              title="Longest Streak"
              value={`${streak.longestStreak ?? 0} day${streak.longestStreak === 1 ? "" : "s"}`}
              icon={<CalendarDays className="text-chart-2" />}
            />
            <DashboardStatCard
              title="Last Check-In"
              value={
                streak.lastCheckIn
                  ? format(streak.lastCheckIn, "Pp")
                  : "No check-ins yet"
              }
              icon={<CalendarCheck className="text-chart-1" />}
            />
          </div>
          <StreakCalendar completionDates={streak.checkInDates} />
        </CardContent>
      </Card>

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
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="text-primary" /> Collaboration Goals
          </CardTitle>
          <CardDescription>
            Track you and your friends' progress together.
          </CardDescription>
          <CardAction>
            <Button variant="outline" asChild>
              <Link href="/collaborations">View Collaborations</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ul className="mt-4 space-y-2">
            <li>
              Your progress: {(stats.completedGoals / stats.totalGoals) * 100}%
            </li>
            <li>Friend A: 80%</li>
            <li>Friend B: 55%</li>
          </ul>
        </CardContent>
      </Card> */}

      {/* Statistics Chart Section (full width) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="text-primary" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasAdvancedAnalytics ? (
            advancedAnalytics ? (
              <AdvancedAnalytics
                goalTrends={advancedAnalytics.goalTrends}
                categoryBreakdown={advancedAnalytics.categoryBreakdown}
              />
            ) : null
          ) : (
            <div className="py-20 text-center">
              <p className="mb-4">
                Advanced analytics are available for pro and elite users.
              </p>
              <Button asChild>
                <Link href="/subscription">Upgrade now</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
