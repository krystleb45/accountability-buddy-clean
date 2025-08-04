// src/reminders/reminderApi.ts

import axios from "axios"

import { http } from "@/utils/http"

export interface Reminder {
  id: string
  title: string
  description?: string
  date: string
  isEnabled: boolean
}

// Simple error logger
function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [reminderApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [reminderApi::${fn}]`, error)
  }
}

/** GET /reminders */
export async function fetchReminders(): Promise<Reminder[]> {
  try {
    const resp = await http.get<Reminder[]>("/reminders")
    return resp.data
  } catch (err) {
    logError("fetchReminders", err)
    return []
  }
}

/** POST /reminders */
export async function createReminder(
  reminderData: Partial<Reminder>,
): Promise<Reminder | null> {
  try {
    const resp = await http.post<Reminder>("/reminders", reminderData)
    return resp.data
  } catch (err) {
    logError("createReminder", err)
    return null
  }
}

/** PUT /reminders/:id */
export async function updateReminder(
  reminderId: string,
  reminderData: Partial<Reminder>,
): Promise<Reminder | null> {
  try {
    const resp = await http.put<Reminder>(
      `/reminders/${encodeURIComponent(reminderId)}`,
      reminderData,
    )
    return resp.data
  } catch (err) {
    logError("updateReminder", err)
    return null
  }
}

/** PUT /reminders/:id/disable */
export async function disableReminder(
  reminderId: string,
): Promise<Reminder | null> {
  try {
    const resp = await http.put<Reminder>(
      `/reminders/${encodeURIComponent(reminderId)}/disable`,
    )
    return resp.data
  } catch (err) {
    logError("disableReminder", err)
    return null
  }
}

/** DELETE /reminders/:id */
export async function deleteReminder(
  reminderId: string,
): Promise<{ message: string } | null> {
  try {
    const resp = await http.delete<{ message: string }>(
      `/reminders/${encodeURIComponent(reminderId)}`,
    )
    return resp.data
  } catch (err) {
    logError("deleteReminder", err)
    return null
  }
}

export default {
  fetchReminders,
  createReminder,
  updateReminder,
  disableReminder,
  deleteReminder,
}
