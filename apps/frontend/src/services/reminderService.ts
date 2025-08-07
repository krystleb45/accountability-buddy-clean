// src/services/reminderService.ts
import type { AxiosResponse } from "axios"

import axios from "axios"

import { http } from "@/lib/http"

export interface Reminder {
  id: string
  user: string
  reminderMessage: string
  reminderTime: string
  recurrence?: string
  disabled?: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface ApiErrorResponse {
  message: string
}

// Exponential-backoff retry helper
async function retry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isServerError =
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500
      if (isServerError && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
        attempt++
        continue
      }
      // No more retries or non-server error
      if (
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.data?.message
      ) {
        throw new Error(err.response.data.message)
      }
      throw err
    }
  }
  throw new Error("Failed after multiple retries")
}

const ReminderService = {
  /** POST /reminders */
  async create(
    reminderMessage: string,
    reminderTime: string,
    recurrence?: string,
  ): Promise<Reminder> {
    const resp = await retry(() =>
      http.post<ApiResponse<{ reminder: Reminder }>>("/reminders", {
        reminderMessage,
        reminderTime,
        recurrence,
      }),
    )
    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to create reminder")
    }
    return resp.data.data!.reminder
  },

  /** GET /reminders */
  async fetchAll(): Promise<Reminder[]> {
    const resp = await retry(() =>
      http.get<ApiResponse<{ reminders: Reminder[] }>>("/reminders"),
    )
    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to load reminders")
    }
    return resp.data.data!.reminders
  },

  /** PUT /reminders/:id */
  async update(
    id: string,
    fields: {
      reminderMessage?: string
      reminderTime?: string
      recurrence?: string
    },
  ): Promise<Reminder> {
    const resp = await retry(() =>
      http.put<ApiResponse<{ reminder: Reminder }>>(
        `/reminders/${encodeURIComponent(id)}`,
        fields,
      ),
    )
    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to update reminder")
    }
    return resp.data.data!.reminder
  },

  /** PUT /reminders/:id/disable */
  async disable(id: string): Promise<Reminder> {
    const resp = await retry(() =>
      http.put<ApiResponse<{ reminder: Reminder }>>(
        `/reminders/${encodeURIComponent(id)}/disable`,
      ),
    )
    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to disable reminder")
    }
    return resp.data.data!.reminder
  },

  /** DELETE /reminders/:id */
  async delete(id: string): Promise<void> {
    const resp = await retry(() =>
      http.delete<ApiResponse<null>>(`/reminders/${encodeURIComponent(id)}`),
    )
    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to delete reminder")
    }
  },
}

export default ReminderService
