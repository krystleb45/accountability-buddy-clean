// src/analytics/goalAnalyticsApi.ts

import axios from "axios"

import { http } from "@/utils/http"

/**
 * Shape of the "data" returned by the API for goal analytics.
 */
export interface UserGoalAnalytics {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  averageCompletionTime?: number
}

export interface GoalAnalytics {
  goalId: string
  name: string
  createdAt: string
  completedAt?: string
  progressHistory: { date: string; progress: number }[]
  metrics: UserGoalAnalytics
}

export interface DateRangeAnalytics {
  startDate: string
  endDate: string
  aggregated: UserGoalAnalytics
}

/**
 * Matches the envelope returned by your Express controllers:
 * {
 *   success: boolean,
 *   message?: string,
 *   data: T
 * }
 */
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/**
 * Log helper to consistently print out Axios errors.
 */
function logError(context: string, err: unknown): void {
  if (axios.isAxiosError(err) && err.response) {
    console.error(`❌ [goalAnalyticsApi::${context}]`, err.response.data)
  } else {
    console.error(`❌ [goalAnalyticsApi::${context}]`, err)
  }
}

/**
 * GET /analytics/goals
 * Fetch overall analytics for the currently authenticated user.
 * Returns UserGoalAnalytics inside data.
 */
export async function getUserGoalAnalytics(): Promise<UserGoalAnalytics | null> {
  try {
    const resp =
      await http.get<ApiResponse<UserGoalAnalytics>>("/analytics/goals")
    return resp.data.data
  } catch (error) {
    logError("getUserGoalAnalytics", error)
    return null
  }
}

/**
 * GET /analytics/goals/:goalId
 * Fetch detailed analytics for a single goal by its ID.
 */
export async function getGoalAnalyticsById(
  goalId: string,
): Promise<GoalAnalytics | null> {
  if (!goalId) return null

  try {
    const resp = await http.get<ApiResponse<GoalAnalytics>>(
      `/analytics/goals/${encodeURIComponent(goalId)}`,
    )
    return resp.data.data
  } catch (error) {
    logError("getGoalAnalyticsById", error)
    return null
  }
}

/**
 * GET /analytics/goals/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Fetch aggregated analytics across all goals in a given date range.
 */
export async function getGoalAnalyticsByDateRange(
  startDate: string,
  endDate: string,
): Promise<DateRangeAnalytics | null> {
  try {
    const resp = await http.get<ApiResponse<DateRangeAnalytics>>(
      `/analytics/goals/date-range`,
      {
        params: { startDate, endDate },
      },
    )
    return resp.data.data
  } catch (error) {
    logError("getGoalAnalyticsByDateRange", error)
    return null
  }
}

export default {
  getUserGoalAnalytics,
  getGoalAnalyticsById,
  getGoalAnalyticsByDateRange,
}
