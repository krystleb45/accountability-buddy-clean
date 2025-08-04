// src/collaboration-goals/collaborationGoalsApi.ts

import type { AxiosError } from "axios"

import axios from "axios"

import { http } from "@/utils/http"

/**
 * A user collaboration goal
 */
export interface CollaborationGoal {
  id: string
  title: string
  description: string
  createdBy: string
  participants: string[]
  progress: number
  dueDate?: string
}

/**
 * Response for listing collaboration goals
 */
export interface GoalsResponse {
  goals: CollaborationGoal[]
  totalPages: number
  currentPage: number
}

// Type guard for Axios errors
function isApiError(error: unknown): error is AxiosError<{ message?: string }> {
  return axios.isAxiosError(error)
}

function handleApiError(message: string, error: unknown): never {
  if (isApiError(error)) {
    const msg = error.response?.data?.message ?? message
    console.error(`❌ [collaborationGoalsApi] ${message}:`, msg)
    throw new Error(msg)
  }
  if (error instanceof Error) {
    console.error(`❌ [collaborationGoalsApi] ${message}:`, error.message)
    throw error
  }
  console.error(`❌ [collaborationGoalsApi] ${message}:`, error)
  throw new Error(message)
}

/** POST /collaboration-goals */
export async function createCollaborationGoal(
  goalData: Partial<CollaborationGoal>,
): Promise<CollaborationGoal> {
  try {
    const response = await http.post<{ data: CollaborationGoal }>(
      "/collaboration-goals",
      goalData,
    )
    return response.data.data
  } catch (error: unknown) {
    handleApiError("Failed to create collaboration goal.", error)
  }
}

/** PUT /collaboration-goals/:id/update-progress */
export async function updateCollaborationGoalProgress(
  goalId: string,
  progress: number,
): Promise<CollaborationGoal> {
  try {
    const response = await http.put<{ data: CollaborationGoal }>(
      `/collaboration-goals/${encodeURIComponent(goalId)}/update-progress`,
      { progress },
    )
    return response.data.data
  } catch (error: unknown) {
    handleApiError("Failed to update goal progress.", error)
  }
}

/** GET /collaboration-goals?page=&limit= */
export async function getUserCollaborationGoals(
  page = 1,
  limit = 10,
): Promise<GoalsResponse> {
  try {
    const response = await http.get<GoalsResponse>("/collaboration-goals", {
      params: { page, limit },
    })
    return response.data
  } catch (error: unknown) {
    handleApiError("Failed to fetch collaboration goals.", error)
  }
}

/** GET /collaboration-goals/:id */
export async function getCollaborationGoalById(
  goalId: string,
): Promise<CollaborationGoal> {
  try {
    const response = await http.get<{ data: CollaborationGoal }>(
      `/collaboration-goals/${encodeURIComponent(goalId)}`,
    )
    return response.data.data
  } catch (error: unknown) {
    handleApiError("Failed to fetch collaboration goal details.", error)
  }
}

/** DELETE /collaboration-goals/:id */
export async function deleteCollaborationGoal(
  goalId: string,
): Promise<{ message: string }> {
  try {
    const response = await http.delete<{ message: string }>(
      `/collaboration-goals/${encodeURIComponent(goalId)}`,
    )
    return response.data
  } catch (error: unknown) {
    handleApiError("Failed to delete collaboration goal.", error)
  }
}

export default {
  createCollaborationGoal,
  updateCollaborationGoalProgress,
  getUserCollaborationGoals,
  getCollaborationGoalById,
  deleteCollaborationGoal,
}
