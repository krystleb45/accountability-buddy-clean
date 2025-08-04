// src/services/goalAnalyticsService.ts
import axios from "axios"

import { http } from "@/utils/http"

export interface UserGoalAnalytics {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  averageCompletionTime?: number // in days
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

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function handleError<T>(
  fn: string,
  error: unknown,
  fallback: ApiResponse<T>,
): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [goalAnalyticsService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [goalAnalyticsService::${fn}]`, error)
  }
  return fallback
}

const GoalAnalyticsService = {
  /** GET /analytics/goals */
  async fetchUserGoalAnalytics(): Promise<ApiResponse<UserGoalAnalytics>> {
    try {
      const resp = await http.get<UserGoalAnalytics>("/analytics/goals")
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("fetchUserGoalAnalytics", err, {
        success: false,
        message: "Failed to load user goal analytics",
      })
    }
  },

  /** GET /analytics/goals/:goalId */
  async fetchGoalAnalyticsById(
    goalId: string,
  ): Promise<ApiResponse<GoalAnalytics>> {
    if (!goalId) {
      return { success: false, message: "Goal ID is required" }
    }
    try {
      const resp = await http.get<GoalAnalytics>(`/analytics/goals/${goalId}`)
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("fetchGoalAnalyticsById", err, {
        success: false,
        message: `Failed to load analytics for goal ${goalId}`,
      })
    }
  },

  /** GET /analytics/goals/date-range?startDate=&endDate= */
  async fetchGoalAnalyticsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<DateRangeAnalytics>> {
    try {
      const resp = await http.get<DateRangeAnalytics>(
        "/analytics/goals/date-range",
        {
          params: { startDate, endDate },
        },
      )
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("fetchGoalAnalyticsByDateRange", err, {
        success: false,
        message: `Failed to load analytics for date range ${startDate} → ${endDate}`,
      })
    }
  },
}

export default GoalAnalyticsService
