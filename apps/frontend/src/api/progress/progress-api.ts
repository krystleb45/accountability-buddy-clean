import type { Envelope } from "@/types"
import type { AccountabilityPartnership, Goal } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface DashboardProgress {
  goals: Pick<
    Goal,
    "title" | "description" | "dueDate" | "status" | "milestones" | "progress"
  >[]
  partnerships: (AccountabilityPartnership & {
    user1: { _id: string; username: string; profilePicture?: string }
    user2: { _id: string; username: string; profilePicture?: string }
  })[]
  level: number
  points: number
  pointsToNextLevel: number
}

/** Fetch the dashboard related progress */
export async function fetchDashboardProgress() {
  try {
    const resp = await http.get<Envelope<DashboardProgress>>(
      "/progress/dashboard",
    )
    return resp.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** Fetch the current user's progress */
export async function fetchProgress() {
  try {
    const resp = await http.get<
      Envelope<{
        goals: Pick<Goal, "title" | "dueDate" | "status" | "progress">[]
      }>
    >("/progress")
    return resp.data.data.goals
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** Update a single goal's progress */
export async function updateProgress(goalId: string, progress: number) {
  if (!goalId.trim() || progress < 0 || progress > 100) {
    console.error("[progressApi] updateProgress: invalid arguments")
    return null
  }
  try {
    const resp = await http.put("/progress/update", {
      goalId,
      progress,
    })
    return resp.data.goal
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** Reset all goals' progress */
export async function resetProgress() {
  try {
    const resp = await http.delete("/progress/reset")
    return resp.data.modifiedCount
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export default {
  fetchProgress,
  updateProgress,
  resetProgress,
}
