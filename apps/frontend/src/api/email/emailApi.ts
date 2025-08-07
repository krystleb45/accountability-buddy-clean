// src/email/emailApi.ts

import axios from "axios"

import { http } from "@/lib/http"

export interface SendEmailPayload {
  to: string
  subject: string
  message: string
}

/**
 * Fire off an email.
 * Returns `true` on success, `false` on failure.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<boolean> {
  try {
    const resp = await http.post<{ success: boolean; message?: string }>(
      "/email/send",
      payload,
    )
    return resp.data.success
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [emailApi::sendEmail]",
        error.response?.data || error.message,
      )
    } else {
      console.error("❌ [emailApi::sendEmail]", error)
    }
    return false
  }
}

export default { sendEmail }
