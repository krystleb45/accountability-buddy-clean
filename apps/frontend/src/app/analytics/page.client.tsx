// src/app/analytics/page.client.tsx
"use client"

import React, { useEffect, useState } from "react"

import type { AnalyticsData, ApiResponse } from "@/api/analytics/analyticsApi"

import {
  getCustomAnalytics,
  getGoalAnalytics,
  getMilestoneAnalytics,
} from "@/api/analytics/analyticsApi"

export default function AnalyticsClient() {
  const [trafficData, setTrafficData] = useState<{
    totalVisitors: number
  } | null>(null)
  const [userActivity, setUserActivity] = useState<{
    activeUsers: number
  } | null>(null)
  const [revenueData, setRevenueData] = useState<{
    totalRevenue: number
  } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect((): void => {
    const fetchAnalytics = async (): Promise<void> => {
      try {
        const trafficResp: ApiResponse<AnalyticsData> = await getGoalAnalytics()
        if (trafficResp.success && trafficResp.data) {
          setTrafficData({
            totalVisitors: trafficResp.data.totalGoalsCompleted,
          })
        } else {
          throw new Error(trafficResp.message || "Failed to load traffic data")
        }

        const activityResp: ApiResponse<AnalyticsData> =
          await getMilestoneAnalytics()
        if (activityResp.success && activityResp.data) {
          setUserActivity({
            activeUsers: activityResp.data.totalMilestonesAchieved,
          })
        } else {
          throw new Error(
            activityResp.message || "Failed to load user activity data",
          )
        }

        const revenueResp: ApiResponse<AnalyticsData> =
          await getCustomAnalytics("2024-01-01", "2024-12-31", "revenue")
        if (revenueResp.success && revenueResp.data) {
          setRevenueData({ totalRevenue: revenueResp.data.newSignups ?? 0 })
        } else {
          throw new Error(revenueResp.message || "Failed to load revenue data")
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-gray-600">Loading analytics…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Analytics Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Gain insights into platform performance, user activity, and more.
        </p>
      </header>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
          <h2 className="mb-2 text-2xl font-semibold">📊 Traffic Overview</h2>
          <p className="mb-4 text-gray-600">Goals completed by all users.</p>
          <p className="text-3xl font-bold text-gray-800">
            {trafficData?.totalVisitors ?? "—"}
          </p>
        </section>
        <section className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
          <h2 className="mb-2 text-2xl font-semibold">👥 User Activity</h2>
          <p className="mb-4 text-gray-600">Milestones achieved by users.</p>
          <p className="text-3xl font-bold text-gray-800">
            {userActivity?.activeUsers ?? "—"}
          </p>
        </section>
        <section className="rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
          <h2 className="mb-2 text-2xl font-semibold">💰 Revenue Insights</h2>
          <p className="mb-4 text-gray-600">
            Calculated custom metric “revenue.”
          </p>
          <p className="text-3xl font-bold text-gray-800">
            ${revenueData?.totalRevenue.toFixed(2) ?? "—"}
          </p>
        </section>
      </main>
      <footer className="mt-12 text-center text-gray-600">
        &copy; {new Date().getFullYear()} Accountability Buddy. All rights
        reserved.
      </footer>
    </div>
  )
}
