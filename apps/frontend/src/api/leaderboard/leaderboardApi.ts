import type { LeaderboardEntry } from "@/types/Gamification.types"

import { http } from "@/utils/http"

/**
 * Fetch sorted, paginated leaderboard.
 */
export async function fetchLeaderboard(
  sortBy: "xp" | "goals" | "streaks" = "xp",
  range: "week" | "month" | "all" = "all",
  type: "global" | "challenge" = "global",
  challengeId?: string,
): Promise<LeaderboardEntry[]> {
  const mapSort = {
    xp: "points",
    goals: "completedGoals",
    streaks: "streakCount",
  } as const
  const mapRange = { week: "weekly", month: "monthly", all: "all" } as const

  const params: Record<string, string> = {
    sortBy: mapSort[sortBy],
    timeRange: mapRange[range],
    type,
    ...(type === "challenge" && challengeId ? { challengeId } : {}),
  }

  try {
    // GET /leaderboard?sortBy=…&timeRange=…&type=…&…
    const resp = await http.get<{
      entries: LeaderboardEntry[]
      pagination?: {
        currentPage: number
        totalPages: number
        totalUsers: number
      }
    }>("/leaderboard", { params })

    // return the array
    return resp.data.entries ?? []
  } catch (err) {
    console.error("❌ [leaderboardApi.fetchLeaderboard] error:", err)
    return []
  }
}

export default { fetchLeaderboard }
