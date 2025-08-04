// src/admin/adminApi.ts
import axios from "axios" // for type‐guarding only

import { http } from "@/utils/http" // our shared Axios/HTTP client

// --------------------------------------------
// Types (must match your backend response shape)
// --------------------------------------------
export interface User {
  id: string
  name: string
  email: string
  isBlocked: boolean
  createdAt: string
  // …any other fields your backend returns…
}

export interface Analytics {
  totalUsers: number
  totalPosts: number
  totalComments: number
  // …etc…
}

export interface Report {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  status: "open" | "resolved" | "dismissed"
  createdAt: string
  // …etc…
}

interface SuccessResponse<T> {
  success: true
  message: string
  data: T
}

interface ErrorResponse {
  success: false
  message: string
}

// --------------------------------------------
// Helper: uniform error logger
// --------------------------------------------
function logApiError(scope: string, err: unknown): void {
  if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
    console.error(`[adminApi][${scope}]`, err.response.data)
  } else {
    console.error(`[adminApi][${scope}]`, err)
  }
}

// --------------------------------------------
// API functions
// --------------------------------------------

/**
 * Fetch a paginated list of users
 * GET /admin/users?page=…&limit=…
 */
export async function fetchUsers(
  page = 1,
  limit = 1000, // by default, pull “all”
): Promise<User[]> {
  try {
    const res = await http.get<SuccessResponse<{ users: User[] }>>(
      `/admin/users`,
      { params: { page, limit } },
    )
    return res.data.data.users
  } catch (err) {
    logApiError("fetchUsers", err)
    throw new Error("Failed to load users")
  }
}

/**
 * Block a user by ID
 * POST /admin/users/:id/block
 */
export async function blockUser(userId: string): Promise<void> {
  try {
    const res = await http.post<SuccessResponse<Record<string, never>>>(
      `/admin/users/${encodeURIComponent(userId)}/block`,
    )
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to block user")
    }
  } catch (err) {
    logApiError("blockUser", err)
    throw new Error("Failed to block user")
  }
}

/**
 * Unblock a user by ID
 * POST /admin/users/:id/unblock
 */
export async function unblockUser(userId: string): Promise<void> {
  try {
    const res = await http.post<SuccessResponse<Record<string, never>>>(
      `/admin/users/${encodeURIComponent(userId)}/unblock`,
    )
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to unblock user")
    }
  } catch (err) {
    logApiError("unblockUser", err)
    throw new Error("Failed to unblock user")
  }
}

/**
 * Fetch site‐wide analytics
 * GET /admin/analytics
 */
export async function fetchAnalytics(): Promise<Analytics> {
  try {
    const res = await http.get<SuccessResponse<Analytics>>(`/admin/analytics`)
    return res.data.data
  } catch (err) {
    logApiError("fetchAnalytics", err)
    throw new Error("Failed to fetch analytics")
  }
}

/**
 * Fetch a paginated list of reports
 * GET /admin/reports?page=…&limit=…
 */
export async function fetchReports(page = 1, limit = 1000): Promise<Report[]> {
  try {
    const res = await http.get<SuccessResponse<{ reports: Report[] }>>(
      `/admin/reports`,
      { params: { page, limit } },
    )
    return res.data.data.reports
  } catch (err) {
    logApiError("fetchReports", err)
    throw new Error("Failed to load reports")
  }
}

/**
 * Resolve or dismiss a given report
 * PATCH /admin/reports/:id [ body = { action: 'resolve' | 'dismiss' } ]
 */
export async function resolveReport(
  reportId: string,
  action: "resolve" | "dismiss",
): Promise<void> {
  try {
    const res = await http.patch<SuccessResponse<Record<string, never>>>(
      `/admin/reports/${encodeURIComponent(reportId)}`,
      { action },
    )
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update report")
    }
  } catch (err) {
    logApiError("resolveReport", err)
    throw new Error("Failed to handle report")
  }
}

export default {
  fetchUsers,
  blockUser,
  unblockUser,
  fetchAnalytics,
  fetchReports,
  resolveReport,
}
