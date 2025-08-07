// src/services/leaderboardService.ts
import axios from "axios"

import { http } from "@/lib/http"

export interface LeaderboardEntry {
  user: {
    _id: string
    username: string
    profilePicture?: string
  }
  completedGoals: number
  completedMilestones: number
  totalPoints: number
}

export interface Pagination {
  totalEntries: number
  currentPage: number
  totalPages: number
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
      `❌ [leaderboardService::${fn}]`,
      error.response?.data || error.message,
    )
    return {
      success: false,
      message:
        (error.response?.data as { message?: string })?.message ||
        error.message,
    }
  } else {
    console.error(`❌ [leaderboardService::${fn}]`, error)
    return { ...fallback, message: "Unexpected error" }
  }
}

const LeaderboardService = {
  /** GET /leaderboard?page=&limit= */
  async getLeaderboard(
    page = 1,
    limit = 10,
  ): Promise<
    ApiResponse<{ leaderboard: LeaderboardEntry[]; pagination: Pagination }>
  > {
    try {
      const resp = await http.get<{
        leaderboard: LeaderboardEntry[]
        pagination: Pagination
      }>("/leaderboard", { params: { page, limit } })
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getLeaderboard", err, { success: false })
    }
  },

  /** GET /leaderboard/user-position */
  async getUserPosition(): Promise<
    ApiResponse<{ userPosition: number; userEntry: LeaderboardEntry }>
  > {
    try {
      const resp = await http.get<{
        userPosition: number
        userEntry: LeaderboardEntry
      }>("/leaderboard/user-position")
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getUserPosition", err, { success: false })
    }
  },

  /** DELETE /leaderboard/reset */
  async resetLeaderboard(): Promise<ApiResponse<null>> {
    try {
      await http.delete("/leaderboard/reset")
      return { success: true, data: null }
    } catch (err) {
      return handleError("resetLeaderboard", err, {
        success: false,
        data: null,
      })
    }
  },

  /** POST /leaderboard/update-points */
  async updatePoints(userId: string): Promise<ApiResponse<null>> {
    try {
      await http.post("/leaderboard/update-points", { userId })
      return { success: true, data: null }
    } catch (err) {
      return handleError("updatePoints", err, { success: false, data: null })
    }
  },
}

export default LeaderboardService
