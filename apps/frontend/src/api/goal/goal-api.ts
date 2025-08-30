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
 * Fetch the current user's streak data
 */
export async function fetchUserStreak() {
  try {
    const resp = await http.get<Envelope<StreakData>>("/goals/streak-dates")
    return resp.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

// export async function fetchUserStatistics(userId: string): Promise<{
//   totalGoals: number
//   completedGoals: number
//   collaborations: number
//   activeGoals: number
//   achievements: string[]
//   goalTrends: { date: string; progress: number }[]
//   categoryBreakdown: { category: string; value: number }[]
//   currentStreak: number
//   longestStreak: number
// } | null> {
//   try {
//     const resp = await http.get<
//       Envelope<{
//         totalGoals: number
//         completedGoals: number
//         collaborations: number
//         activeGoals: number
//         achievements: string[]
//         goalTrends: { date: string; progress: number }[]
//         categoryBreakdown: { category: string; value: number }[]
//         currentStreak: number
//         longestStreak: number
//       }>
//     >(`/users/${encodeURIComponent(userId)}/statistics`)
//     const data = resp.data.data
//     return {
//       totalGoals: data.totalGoals ?? 0,
//       completedGoals: data.completedGoals ?? 0,
//       collaborations: data.collaborations ?? 0,
//       activeGoals: data.activeGoals ?? 0,
//       achievements: data.achievements ?? [],
//       goalTrends: data.goalTrends ?? [],
//       categoryBreakdown: data.categoryBreakdown ?? [],
//       currentStreak: data.currentStreak ?? 0,
//       longestStreak: data.longestStreak ?? 0,
//     }
//   } catch (err) {
//     logErr("fetchUserStatistics", err)
//     return null
//   }
// }

// export async function updateUserStreak(
//   userId: string,
// ): Promise<{ success: boolean; message: string } | null> {
//   try {
//     const resp = await http.post<
//       Envelope<{ success: boolean; message: string }>
//     >("/goals/streak/update", { userId })
//     return resp.data.data
//   } catch (err) {
//     logErr("updateUserStreak", err)
//     return null
//   }
// }

// // ─── REMINDERS ────────────────────────────────────────────────────────────────
// export async function fetchGoalReminders(
//   goalId: string,
// ): Promise<GoalReminder[] | null> {
//   try {
//     const resp = await http.get<Envelope<GoalReminder[]>>(
//       `/goals/${encodeURIComponent(goalId)}/reminders`,
//     )
//     return resp.data.data
//   } catch (err) {
//     logErr("fetchGoalReminders", err)
//     return null
//   }
// }

// export async function createGoalReminder(
//   goalId: string,
//   date: string,
//   time: string,
// ): Promise<GoalReminder | null> {
//   try {
//     const resp = await http.post<Envelope<GoalReminder>>(
//       `/goals/${encodeURIComponent(goalId)}/reminders`,
//       { date, time },
//     )
//     return resp.data.data
//   } catch (err) {
//     logErr("createGoalReminder", err)
//     return null
//   }
// }

// // ─── PINNING ─────────────────────────────────────────────────────────────────
// export async function pinGoal(
//   userId: string,
//   goalId: string,
// ): Promise<PinGoalResponse | null> {
//   try {
//     const resp = await http.post<Envelope<PinGoalResponse>>(
//       `/users/${encodeURIComponent(userId)}/pin-goal`,
//       { goalId },
//     )
//     return resp.data.data
//   } catch (err) {
//     logErr("pinGoal", err)
//     return null
//   }
// }

// export async function unpinGoal(
//   userId: string,
//   goalId: string,
// ): Promise<PinGoalResponse | null> {
//   try {
//     const resp = await http.post<Envelope<PinGoalResponse>>(
//       `/users/${encodeURIComponent(userId)}/unpin-goal`,
//       { goalId },
//     )
//     return resp.data.data
//   } catch (err) {
//     logErr("unpinGoal", err)
//     return null
//   }
// }

// export async function fetchPinnedGoals(
//   userId: string,
// ): Promise<string[] | null> {
//   try {
//     const resp = await http.get<Envelope<{ pinnedGoals: string[] }>>(
//       `/users/${encodeURIComponent(userId)}/pinned-goals`,
//     )
//     return resp.data.data.pinnedGoals
//   } catch (err) {
//     logErr("fetchPinnedGoals", err)
//     return null
//   }
// }

// export async function fetchUserGoalsWithPinned(
//   userId: string,
// ): Promise<{ goals: GoalReminder[]; pinnedGoals: string[] } | null> {
//   try {
//     const resp = await http.get<
//       Envelope<{ goals: GoalReminder[]; pinnedGoals: string[] }>
//     >(`/users/${encodeURIComponent(userId)}/goals-with-pinned`)
//     return resp.data.data
//   } catch (err) {
//     logErr("fetchUserGoalsWithPinned", err)
//     return null
//   }
// }

// // ─── CRUD FOR FULL GOAL ENTITIES ──────────────────────────────────────────────
// export async function createGoal(payload: {
//   title: string
//   description?: string
//   deadline: string
//   category: string
// }): Promise<Goal> {
//   try {
//     const resp = await http.post<Envelope<{ goal: RawGoal }>>("/goals", payload)
//     const g = resp.data.data.goal
//     return {
//       progress: 0,
//       id: g._id,
//       title: g.title,
//       description: g.description ?? "",
//       deadline: g.dueDate,
//       category: g.category,
//       reminders: g.reminders,
//     }
//   } catch (err) {
//     logErr("createGoal", err)
//     throw err
//   }
// }

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
