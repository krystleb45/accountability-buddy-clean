// src/goals/goalsApi.ts

import axios from "axios"

import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────────

export interface StreakData {
  dates: string[]
  analytics: {
    tier: User["subscriptionTier"]
    hasAdvancedAnalytics: boolean
    isInTrial: boolean
    upgradePrompt: string | null
  }
}

export interface GoalReminder {
  id: string
  goalId: string
  date: string
  time: string
}

export interface PinGoalResponse {
  message: string
  pinnedGoals: string[]
}

// Raw shape returned by the server for a Goal
interface RawGoal {
  _id: string
  title: string
  description?: string
  dueDate: string
  category: string
  reminders: GoalReminder[]
}

// **Full** Goal type for your UI
export interface Goal {
  progress?: any
  id: string
  title: string
  description: string // always a string
  deadline: string
  category: string
  reminders: GoalReminder[]
}

interface ApiError {
  message: string
}

function logErr(scope: string, err: unknown): void {
  if (axios.isAxiosError<ApiError>(err) && err.response) {
    console.error(`[goalsApi::${scope}]`, err.response.data.message)
  } else {
    console.error(`[goalsApi::${scope}]`, err)
  }
}

// ─── STREAK & STATS ────────────────────────────────────────────────────────────

/**
 * Fetch the current user's streak data
 */
export async function fetchUserStreak() {
  try {
    const resp = await http.get<Envelope<StreakData>>("/goals/streak-dates")
    return resp.data.data
  } catch (err) {
    logErr("fetchUserStreak", err)
    return null
  }
}

export async function fetchUserStatistics(userId: string): Promise<{
  totalGoals: number
  completedGoals: number
  collaborations: number
  activeGoals: number
  achievements: string[]
  goalTrends: { date: string; progress: number }[]
  categoryBreakdown: { category: string; value: number }[]
  currentStreak: number
  longestStreak: number
} | null> {
  try {
    const resp = await http.get<
      Envelope<{
        totalGoals: number
        completedGoals: number
        collaborations: number
        activeGoals: number
        achievements: string[]
        goalTrends: { date: string; progress: number }[]
        categoryBreakdown: { category: string; value: number }[]
        currentStreak: number
        longestStreak: number
      }>
    >(`/users/${encodeURIComponent(userId)}/statistics`)
    const data = resp.data.data
    return {
      totalGoals: data.totalGoals ?? 0,
      completedGoals: data.completedGoals ?? 0,
      collaborations: data.collaborations ?? 0,
      activeGoals: data.activeGoals ?? 0,
      achievements: data.achievements ?? [],
      goalTrends: data.goalTrends ?? [],
      categoryBreakdown: data.categoryBreakdown ?? [],
      currentStreak: data.currentStreak ?? 0,
      longestStreak: data.longestStreak ?? 0,
    }
  } catch (err) {
    logErr("fetchUserStatistics", err)
    return null
  }
}

export async function updateUserStreak(
  userId: string,
): Promise<{ success: boolean; message: string } | null> {
  try {
    const resp = await http.post<
      Envelope<{ success: boolean; message: string }>
    >("/goals/streak/update", { userId })
    return resp.data.data
  } catch (err) {
    logErr("updateUserStreak", err)
    return null
  }
}

// ─── REMINDERS ────────────────────────────────────────────────────────────────
export async function fetchGoalReminders(
  goalId: string,
): Promise<GoalReminder[] | null> {
  try {
    const resp = await http.get<Envelope<GoalReminder[]>>(
      `/goals/${encodeURIComponent(goalId)}/reminders`,
    )
    return resp.data.data
  } catch (err) {
    logErr("fetchGoalReminders", err)
    return null
  }
}

export async function createGoalReminder(
  goalId: string,
  date: string,
  time: string,
): Promise<GoalReminder | null> {
  try {
    const resp = await http.post<Envelope<GoalReminder>>(
      `/goals/${encodeURIComponent(goalId)}/reminders`,
      { date, time },
    )
    return resp.data.data
  } catch (err) {
    logErr("createGoalReminder", err)
    return null
  }
}

// ─── PINNING ─────────────────────────────────────────────────────────────────
export async function pinGoal(
  userId: string,
  goalId: string,
): Promise<PinGoalResponse | null> {
  try {
    const resp = await http.post<Envelope<PinGoalResponse>>(
      `/users/${encodeURIComponent(userId)}/pin-goal`,
      { goalId },
    )
    return resp.data.data
  } catch (err) {
    logErr("pinGoal", err)
    return null
  }
}

export async function unpinGoal(
  userId: string,
  goalId: string,
): Promise<PinGoalResponse | null> {
  try {
    const resp = await http.post<Envelope<PinGoalResponse>>(
      `/users/${encodeURIComponent(userId)}/unpin-goal`,
      { goalId },
    )
    return resp.data.data
  } catch (err) {
    logErr("unpinGoal", err)
    return null
  }
}

export async function fetchPinnedGoals(
  userId: string,
): Promise<string[] | null> {
  try {
    const resp = await http.get<Envelope<{ pinnedGoals: string[] }>>(
      `/users/${encodeURIComponent(userId)}/pinned-goals`,
    )
    return resp.data.data.pinnedGoals
  } catch (err) {
    logErr("fetchPinnedGoals", err)
    return null
  }
}

export async function fetchUserGoalsWithPinned(
  userId: string,
): Promise<{ goals: GoalReminder[]; pinnedGoals: string[] } | null> {
  try {
    const resp = await http.get<
      Envelope<{ goals: GoalReminder[]; pinnedGoals: string[] }>
    >(`/users/${encodeURIComponent(userId)}/goals-with-pinned`)
    return resp.data.data
  } catch (err) {
    logErr("fetchUserGoalsWithPinned", err)
    return null
  }
}

// ─── CRUD FOR FULL GOAL ENTITIES ──────────────────────────────────────────────
export async function createGoal(payload: {
  title: string
  description?: string
  deadline: string
  category: string
}): Promise<Goal> {
  try {
    const resp = await http.post<Envelope<{ goal: RawGoal }>>("/goals", payload)
    const g = resp.data.data.goal
    return {
      progress: 0,
      id: g._id,
      title: g.title,
      description: g.description ?? "",
      deadline: g.dueDate,
      category: g.category,
      reminders: g.reminders,
    }
  } catch (err) {
    logErr("createGoal", err)
    throw err
  }
}

export async function updateGoal(
  goalId: string,
  payload: Partial<{
    title: string
    description?: string
    deadline: string
    category: string
    progress: number
  }>,
): Promise<boolean> {
  try {
    const resp = await http.put<Envelope<{ success: boolean }>>(
      `/goals/${encodeURIComponent(goalId)}`,
      payload,
    )
    return resp.data.data.success
  } catch (err) {
    logErr("updateGoal", err)
    return false
  }
}

export async function fetchGoals(): Promise<Goal[]> {
  try {
    const resp = await http.get<Envelope<{ goals: RawGoal[] }>>("/goals")
    return resp.data.data.goals.map((g) => ({
      progress: 0,
      id: g._id,
      title: g.title,
      description: g.description ?? "",
      deadline: g.dueDate,
      category: g.category,
      reminders: g.reminders,
    }))
  } catch (err) {
    logErr("fetchGoals", err)
    return []
  }
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    const resp = await http.delete<Envelope<{ success: boolean }>>(
      `/goals/${encodeURIComponent(goalId)}`,
    )
    return resp.data.data.success
  } catch (err) {
    logErr("deleteGoal", err)
    return false
  }
}

export default {
  fetchUserStreak,
  fetchUserStatistics,
  updateUserStreak,
  fetchGoalReminders,
  createGoalReminder,
  pinGoal,
  unpinGoal,
  fetchPinnedGoals,
  fetchUserGoalsWithPinned,
  createGoal,
  updateGoal,
  fetchGoals,
  deleteGoal,
}
