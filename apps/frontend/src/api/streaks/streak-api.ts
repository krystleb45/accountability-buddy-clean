import type { Envelope } from "@/types"
import type { Streak } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface LeaderboardPage {
  streaks: Streak[]
  pagination: {
    totalEntries: number
    currentPage: number
    totalPages: number
  }
}

/** Fetch the current user's streak */
export async function fetchUserStreak() {
  try {
    const resp = await http.get<Envelope<{ streak: Streak }>>("/streaks")
    return resp.data.data.streak
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
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
    throw new Error(getApiErrorMessage(err as Error))
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
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export default {
  fetchUserStreak,
  checkIn,
  fetchLeaderboard,
}
