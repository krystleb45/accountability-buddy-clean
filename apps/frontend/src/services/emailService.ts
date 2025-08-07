// src/services/emailService.ts
import axios from "axios"

import { http } from "@/lib/http"

export interface SendEmailPayload {
  to: string
  subject: string
  message: string
}

const EmailService = {
  /** Send a transactional email */
  async sendEmail(data: SendEmailPayload): Promise<void> {
    try {
      // baseURL already includes `/api`, so we call `/email/send`
      const resp = await http.post<{ success: boolean; message?: string }>(
        "/email/send",
        data,
      )

      if (!resp.data.success) {
        throw new Error(resp.data.message || "Failed to send email")
      }
    } catch (error) {
      // Log and re-throw in a consistent way
      if (axios.isAxiosError(error)) {
        console.error(
          "❌ [EmailService::sendEmail]",
          error.response?.data || error.message,
        )
        throw new Error(
          (error.response?.data as { message?: string })?.message ||
            "Failed to send email",
        )
      }
      console.error("❌ [EmailService::sendEmail]", error)
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred",
      )
    }
  },
}

export default EmailService
