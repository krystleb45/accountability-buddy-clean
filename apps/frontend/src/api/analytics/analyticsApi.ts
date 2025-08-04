// src/analytics/analyticsApi.ts
import axios from "axios"

import { http } from "@/utils/http"

export interface AnalyticsData {
  totalGoalsCompleted: number
  totalMilestonesAchieved: number
  activeUsers?: number
  newSignups?: number
  [key: string]: number | undefined
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

/**
 * Uniform error handler that returns a failed ApiResponse<T>
 */
function handleApiError<T>(scope: string, err: unknown): ApiResponse<T> {
  if (axios.isAxiosError(err) && err.response) {
    console.error(
      `[analyticsApi][${scope}]`,
      err.response.data?.message || err.message,
    )
    return {
      success: false,
      message: err.response.data?.message || "An error occurred.",
    }
  }
  console.error(`[analyticsApi][${scope}]`, err)
  return { success: false, message: "An unexpected error occurred." }
}

/**
 * GET /admin/analytics/goals
 * Returns overall goal-related analytics.
 */
export async function getGoalAnalytics(): Promise<ApiResponse<AnalyticsData>> {
  try {
    const res = await http.get<ApiResponse<AnalyticsData>>(
      "/admin/analytics/goals",
    )
    return res.data
  } catch (err) {
    return handleApiError("getGoalAnalytics", err)
  }
}

/**
 * GET /admin/analytics/milestones
 * Returns milestone‐specific analytics.
 */
export async function getMilestoneAnalytics(): Promise<
  ApiResponse<AnalyticsData>
> {
  try {
    const res = await http.get<ApiResponse<AnalyticsData>>(
      "/admin/analytics/milestones",
    )
    return res.data
  } catch (err) {
    return handleApiError("getMilestoneAnalytics", err)
  }
}

/**
 * POST /admin/analytics/custom
 * Request body: { startDate, endDate, metric }
 */
export async function getCustomAnalytics(
  startDate: string,
  endDate: string,
  metric: string,
): Promise<ApiResponse<AnalyticsData>> {
  try {
    const res = await http.post<ApiResponse<AnalyticsData>>(
      "/admin/analytics/custom",
      { startDate, endDate, metric },
    )
    return res.data
  } catch (err) {
    return handleApiError("getCustomAnalytics", err)
  }
}
