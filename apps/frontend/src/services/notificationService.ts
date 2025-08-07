// src/services/notificationService.ts
import type { AxiosResponse } from "axios"

import axios from "axios"

import { http } from "@/lib/http"

export interface Notification {
  id: string
  sender?: string
  user?: string
  message: string
  type?: string
  link?: string
  read: boolean
  createdAt: string
  [key: string]: unknown
}

interface ApiErrorResponse {
  message: string
}

// Retry helper with a bounded loop
async function axiosRetry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isAxiosErr = axios.isAxiosError(err)
      const status = isAxiosErr ? err.response?.status : undefined
      const shouldRetry =
        isAxiosErr &&
        status !== undefined &&
        status >= 500 &&
        attempt < retries - 1
      if (shouldRetry) {
        // exponential backoff
        await new Promise((res) => setTimeout(res, 2 ** attempt * 1000))
        attempt++
        continue
      }
      // no more retries or non-server error
      console.error(`[NotificationService][attempt ${attempt + 1}]`, err)
      if (isAxiosErr && err.response?.data) {
        const payload = err.response.data as ApiErrorResponse
        throw new Error(payload.message)
      }
      throw new Error("An unexpected error occurred. Please try again later.")
    }
  }
  throw new Error("Failed after multiple retries.")
}

const NotificationService = {
  /** GET /notifications */
  async getUserNotifications(): Promise<Notification[]> {
    const resp = await axiosRetry(() =>
      http.get<Notification[]>("/notifications"),
    )
    return resp.data
  },

  /** POST /notifications */
  async sendNotification(
    receiverId: string,
    message: string,
    type?: string,
    link?: string,
  ): Promise<Notification> {
    const resp = await axiosRetry(() =>
      http.post<{ notification: Notification }>("/notifications", {
        receiverId,
        message,
        type,
        link,
      }),
    )
    return resp.data.notification
  },

  /** PATCH /notifications/read */
  async markNotificationsAsRead(notificationIds: string[]): Promise<number> {
    const resp = await axiosRetry(() =>
      http.patch<{ updatedCount: number }>("/notifications/read", {
        notificationIds,
      }),
    )
    return resp.data.updatedCount
  },

  /** DELETE /notifications/:id */
  async deleteNotification(notificationId: string): Promise<void> {
    await axiosRetry(() =>
      http.delete(`/notifications/${encodeURIComponent(notificationId)}`),
    )
  },

  /** DELETE /notifications/delete-all */
  async deleteAllNotifications(): Promise<void> {
    await axiosRetry(() => http.delete("/notifications/delete-all"))
  },
}

export default NotificationService
