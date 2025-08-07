// src/services/adminAnalyticsService.ts
import axios from "axios" // for axios.isAxiosError

import { http } from "@/lib/http" // your shared axios instance

// ── Types ─────────────────────────────────────────────────────

export interface DashboardAnalytics {
  totalUsers: number
  activeUsers: number
  reports: number
}

export interface UserAnalytics {
  [key: string]: unknown
}

export interface GlobalAnalytics {
  data: Record<string, unknown>
}

export interface FinancialAnalytics {
  [key: string]: unknown
}

export interface CustomAnalytics {
  analytics: {
    startDate: string
    endDate: string
    metric: string
    value: number
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// ── Error Helper ─────────────────────────────────────────────

function handleApiError<T>(scope: string, error: unknown): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    console.error(
      `[adminAnalyticsService] ${scope}:`,
      error.response?.data || error.message,
    )
    return {
      success: false,
      message:
        (error.response?.data as { message?: string })?.message ||
        "An unexpected error occurred.",
    }
  }
  console.error(`[adminAnalyticsService] ${scope}:`, error)
  return { success: false, message: "An unexpected error occurred." }
}

// ── Service ──────────────────────────────────────────────────

const AdminAnalyticsService = {
  async getDashboard(): Promise<ApiResponse<DashboardAnalytics>> {
    try {
      const { data } = await http.get<DashboardAnalytics>("/admin/analytics")
      return { success: true, data }
    } catch (e) {
      return handleApiError("getDashboard", e)
    }
  },

  async getUsers(): Promise<ApiResponse<UserAnalytics>> {
    try {
      const { data } = await http.get<UserAnalytics>("/admin/analytics/users")
      return { success: true, data }
    } catch (e) {
      return handleApiError("getUsers", e)
    }
  },

  async getGoals(): Promise<ApiResponse<GlobalAnalytics>> {
    try {
      const { data } = await http.get<Record<string, unknown>>(
        "/admin/analytics/goals",
      )
      return { success: true, data: { data } }
    } catch (e) {
      return handleApiError("getGoals", e)
    }
  },

  async getFinancial(): Promise<ApiResponse<FinancialAnalytics>> {
    try {
      const { data } = await http.get<FinancialAnalytics>(
        "/admin/analytics/financial",
      )
      return { success: true, data }
    } catch (e) {
      return handleApiError("getFinancial", e)
    }
  },

  async getCustom(
    startDate: string,
    endDate: string,
    metric: string,
  ): Promise<ApiResponse<CustomAnalytics>> {
    try {
      const { data } = await http.post<CustomAnalytics>(
        "/admin/analytics/custom",
        {
          startDate,
          endDate,
          metric,
        },
      )
      return { success: true, data }
    } catch (e) {
      return handleApiError("getCustom", e)
    }
  },
}

export default AdminAnalyticsService
