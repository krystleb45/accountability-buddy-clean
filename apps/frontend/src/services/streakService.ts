// src/services/streakService.ts
import type { AxiosResponse } from "axios"

import axios from "axios"

import { http } from "@/lib/http"

export interface Streak {
  _id: string
  user: { _id: string; username: string; profilePicture?: string }
  streakCount: number
  lastCheckIn: string | null
}

export interface LeaderboardPage {
  streaks: Streak[]
  pagination: {
    totalEntries: number
    currentPage: number
    totalPages: number
  }
}

interface ApiError {
  message: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

// Exponential‑backoff retry helper
async function retry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isServerError =
        axios.isAxiosError<ApiError>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500
      if (isServerError && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
        attempt++
        continue
      }
      throw err
    }
  }
  throw new Error("Failed after multiple retries.")
}

const StreakService = {
  /** GET /streaks */
  async getUserStreak(): Promise<Streak> {
    const resp = await retry(() =>
      http.get<ApiResponse<{ streak: Streak }>>("/streaks"),
    )
    if (!resp.data.success || !resp.data.data) {
      throw new Error(resp.data.message || "Failed to fetch streak")
    }
    return resp.data.data.streak
  },

  /** POST /streaks/check-in */
  async logDailyCheckIn(date?: string): Promise<Streak> {
    const payload = date ? { date } : {}
    const resp = await retry(() =>
      http.post<ApiResponse<{ streak: Streak }>>("/streaks/check-in", payload),
    )
    if (!resp.data.success || !resp.data.data) {
      throw new Error(resp.data.message || "Failed to log check-in")
    }
    return resp.data.data.streak
  },

  /** GET /streaks/leaderboard?page=…&limit=… */
  async getLeaderboard(page = 1, limit = 10): Promise<LeaderboardPage> {
    const resp = await retry(() =>
      http.get<ApiResponse<LeaderboardPage>>("/streaks/leaderboard", {
        params: { page, limit },
      }),
    )
    if (!resp.data.success || !resp.data.data) {
      throw new Error(resp.data.message || "Failed to fetch leaderboard")
    }
    return resp.data.data
  },
}

export default StreakService
