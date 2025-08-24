import type { Envelope } from "@/types"
import type { Gamification, User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

// Fetch leaderboard entries + pagination
export async function fetchLeaderboard({
  page = 1,
  limit = 10,
}: { page?: number; limit?: number } = {}) {
  try {
    const res = await http.get<
      Envelope<{
        entries: Array<
          Gamification & {
            userId: Pick<User, "_id" | "username" | "profilePicture">
          }
        >
        pagination: {
          currentPage: number
          totalPages: number
          totalUsers: number
        }
      }>
    >("/gamification/leaderboard", { params: { page, limit } })
    return res.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

// Award or add points
export async function addPoints(
  userId: string,
  points: number,
): Promise<boolean> {
  try {
    await http.post("/gamification/add-points", { userId, points })
    return true
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

export default {
  fetchLeaderboard,
  addPoints,
}
