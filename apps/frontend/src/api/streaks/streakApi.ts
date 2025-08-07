// src/streaks/streakApi.ts

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

function logError(fn: string, err: unknown): void {
  if (axios.isAxiosError(err)) {
    console.error(`❌ [streakApi::${fn}]`, err.response?.data || err.message)
  } else {
    console.error(`❌ [streakApi::${fn}]`, err)
  }
}

/** Fetch the current user's streak */
export async function fetchUserStreak(): Promise<Streak | null> {
  try {
    const resp = await http.get<Streak>("/streaks")
    return resp.data
  } catch (err) {
    logError("fetchUserStreak", err)
    return null
  }
}

/** Log today's check-in (optional date) */
export async function checkIn(date?: string): Promise<Streak | null> {
  try {
    const resp = await http.post<Streak>(
      "/streaks/check-in",
      date ? { date } : {},
    )
    return resp.data
  } catch (err) {
    logError("checkIn", err)
    return null
  }
}

/** Fetch the streak leaderboard */
export async function fetchLeaderboard(
  page = 1,
  limit = 10,
): Promise<LeaderboardPage> {
  try {
    const resp = await http.get<LeaderboardPage>("/streaks/leaderboard", {
      params: { page, limit },
    })
    return resp.data
  } catch (err) {
    logError("fetchLeaderboard", err)
    return {
      streaks: [],
      pagination: { totalEntries: 0, currentPage: 1, totalPages: 0 },
    }
  }
}

export default {
  fetchUserStreak,
  checkIn,
  fetchLeaderboard,
}
