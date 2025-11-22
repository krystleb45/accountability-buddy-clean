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
