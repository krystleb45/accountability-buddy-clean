// src/api/feedback/feedbackApi.ts

import axios from "axios"

import { http } from "@/utils/http"

export interface FeedbackItem {
  id: string
  feedback: string
  userId?: string
  createdAt: string
}

/**
 * Submit user feedback.
 * Now hits Next’s proxy at /api/feedback/submit, which in turn forwards
 * { message, type } to Express’s POST /api/feedback.
 */
export async function submitFeedback(feedback: string): Promise<boolean> {
  if (!feedback.trim()) {
    console.error("[feedbackApi::submitFeedback] Feedback cannot be empty.")
    return false
  }

  try {
    // 1) Call our Next.js proxy at /api/feedback/submit,
    //    sending { feedback }. The proxy re-shapes to { message, type }.
    const { data } = await http.post<{ success: boolean; message?: string }>(
      "/feedback/submit",
      { feedback },
    )

    return data.success
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[feedbackApi::submitFeedback]",
        error.response?.data || error.message,
      )
    } else {
      console.error("[feedbackApi::submitFeedback]", error)
    }
    return false
  }
}

/**
 * Fetch the feedback feed.
 * GET /feedback/feed → Next.js proxy → GET BACKEND_URL/api/feedback
 */
export async function fetchFeedbackFeed(): Promise<FeedbackItem[]> {
  try {
    const { data } = await http.get<{ success: boolean; data: FeedbackItem[] }>(
      "/feedback/feed",
    )
    return data.success ? data.data : []
  } catch (error) {
    console.error("[feedbackApi::fetchFeedbackFeed]", error)
    return []
  }
}

/**
 * Delete a feedback entry.
 * DELETE /feedback/:feedbackId → Next.js proxy → DELETE BACKEND_URL/api/feedback/:feedbackId
 */
export async function deleteFeedback(feedbackId: string): Promise<boolean> {
  if (!feedbackId) {
    console.error("[feedbackApi::deleteFeedback] feedbackId is required.")
    return false
  }
  try {
    const { data } = await http.delete<{ success: boolean; message?: string }>(
      `/feedback/${encodeURIComponent(feedbackId)}`,
    )
    return data.success
  } catch (error) {
    console.error("[feedbackApi::deleteFeedback]", error)
    return false
  }
}

export default {
  submitFeedback,
  fetchFeedbackFeed,
  deleteFeedback,
}
