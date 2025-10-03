import type { GoalCreateInput } from "@/components/goals/goal-form"
import type { Envelope } from "@/types"
import type { Goal, Milestone, Reminder, User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface StreakData {
  dates: string[]
  analytics: {
    tier: User["subscriptionTier"]
    hasAdvancedAnalytics: boolean
    isInTrial: boolean
    upgradePrompt: string | null
  }
}

/**
 * Fetch the current user's goals streak data
 */
export async function fetchUserGoalsStreak() {
  try {
    const resp = await http.get<Envelope<StreakData>>("/goals/streak-dates")
    return resp.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function updateGoal(goalId: string, payload: GoalCreateInput) {
  try {
    await http.put<Envelope<{ success: boolean }>>(
      `/goals/${encodeURIComponent(goalId)}`,
      payload,
    )
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchUserGoals() {
  try {
    const resp = await http.get<Envelope<{ goals: Goal[] }>>("/goals")
    return resp.data.data.goals
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchUserGoalCategories() {
  try {
    const resp =
      await http.get<Envelope<{ categories: string[] }>>("/goals/categories")
    return resp.data.data.categories
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function createGoal(payload: GoalCreateInput) {
  try {
    await http.post<Envelope<{ goal: Goal }>>("/goals", payload)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchGoalDetails(goalId: string) {
  try {
    const resp = await http.get<
      Envelope<{
        goal: Goal & {
          reminders: Reminder[]
          milestones: Milestone[]
        }
      }>
    >(`/goals/${encodeURIComponent(goalId)}`)
    return resp.data.data.goal
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function deleteGoal(goalId: string) {
  try {
    await http.delete(`/goals/${encodeURIComponent(goalId)}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function updateGoalProgress(goalId: string, progress: number) {
  try {
    await http.patch(`/goals/${encodeURIComponent(goalId)}/progress`, {
      progress,
    })
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function getMemberGoals(username: string) {
  try {
    const resp = await http.get<Envelope<{ goals: Goal[] }>>(
      `/goals/member/${encodeURIComponent(username)}`,
    )
    return resp.data.data.goals
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
