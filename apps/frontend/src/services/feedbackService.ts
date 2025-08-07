// src/services/feedbackService.ts
import axios from "axios"

import { http } from "@/lib/http"

export interface FeedbackItem {
  id: string
  feedback: string
  userId?: string
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function handleError<T>(fn: string, error: unknown, fallback: T): T {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [feedbackService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [feedbackService::${fn}]`, error)
  }
  return fallback
}

const FeedbackService = {
  /** POST /feedback/submit */
  async submitFeedback(
    feedback: string,
    userId: string,
  ): Promise<ApiResponse<null>> {
    if (!feedback.trim()) {
      return { success: false, message: "Feedback cannot be empty." }
    }
    try {
      const resp = await http.post<ApiResponse<null>>("/feedback/submit", {
        feedback,
        userId,
      })
      return resp.data
    } catch (err) {
      return handleError("submitFeedback", err, {
        success: false,
        message: "Failed to submit feedback.",
      })
    }
  },

  /** GET /feedback/feed */
  async getFeedbackFeed(): Promise<ApiResponse<FeedbackItem[]>> {
    try {
      const resp = await http.get<ApiResponse<FeedbackItem[]>>("/feedback/feed")
      return resp.data
    } catch (err) {
      return handleError("getFeedbackFeed", err, {
        success: false,
        data: [],
        message: "Failed to fetch feedback feed.",
      })
    }
  },

  /** DELETE /feedback/:feedbackId */
  async deleteFeedback(feedbackId: string): Promise<ApiResponse<null>> {
    if (!feedbackId) {
      return { success: false, message: "Feedback ID cannot be empty." }
    }
    try {
      const resp = await http.delete<ApiResponse<null>>(
        `/feedback/${feedbackId}`,
      )
      return resp.data
    } catch (err) {
      return handleError("deleteFeedback", err, {
        success: false,
        message: "Failed to delete feedback.",
      })
    }
  },
}

export default FeedbackService
