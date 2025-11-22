import axios from "axios"

import { http } from "@/lib/http"

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
