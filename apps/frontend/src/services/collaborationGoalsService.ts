// src/services/collaborationGoalsService.ts
import axios from "axios"

import { http } from "@/lib/http"

export interface CollaborationGoal {
  id: string
  title: string
  description: string
  createdBy: string
  participants: string[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function handleError<T>(fn: string, error: unknown, fallback: T): T {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [collaborationGoalsService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [collaborationGoalsService::${fn}]`, error)
  }
  return fallback
}

const CollaborationGoalsService = {
  /** POST /collaboration-goals */
  async createGoal(
    title: string,
    description: string,
    participants: string[],
  ): Promise<ApiResponse<CollaborationGoal>> {
    try {
      const resp = await http.post<CollaborationGoal>("/collaboration-goals", {
        title,
        description,
        participants,
      })
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("createGoal", err, {
        success: false,
        message: "Failed to create goal.",
      })
    }
  },

  /** GET /collaboration-goals */
  async getMyGoals(): Promise<ApiResponse<CollaborationGoal[]>> {
    try {
      const resp = await http.get<CollaborationGoal[]>("/collaboration-goals")
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getMyGoals", err, {
        success: false,
        data: [],
        message: "Failed to load goals.",
      })
    }
  },

  /** DELETE /collaboration-goals/:id */
  async deleteGoal(id: string): Promise<ApiResponse<null>> {
    if (!id) return { success: false, message: "Goal ID is required." }
    try {
      await http.delete(`/collaboration-goals/${id}`)
      return { success: true }
    } catch (err) {
      return handleError("deleteGoal", err, {
        success: false,
        message: "Failed to delete goal.",
      })
    }
  },

  /** POST /collaboration-goals/add-participant */
  async addParticipant(
    goalId: string,
    participantId: string,
  ): Promise<ApiResponse<CollaborationGoal>> {
    if (!goalId || !participantId) {
      return {
        success: false,
        message: "Goal ID and participant ID are required.",
      }
    }
    try {
      const resp = await http.post<CollaborationGoal>(
        "/collaboration-goals/add-participant",
        {
          goalId,
          participantId,
        },
      )
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("addParticipant", err, {
        success: false,
        message: "Failed to add participant.",
      })
    }
  },

  /** GET /collaboration-goals/:id */
  async getGoalById(id: string): Promise<ApiResponse<CollaborationGoal>> {
    if (!id) return { success: false, message: "Goal ID is required." }
    try {
      const resp = await http.get<CollaborationGoal>(
        `/collaboration-goals/${id}`,
      )
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getGoalById", err, {
        success: false,
        message: "Failed to load goal.",
      })
    }
  },
}

export default CollaborationGoalsService
