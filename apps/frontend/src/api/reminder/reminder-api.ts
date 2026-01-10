import type { Envelope } from "@/types"
import type { Goal, Reminder } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export type ReminderWithGoal = Reminder & {
  goal?: Pick<Goal, "_id" | "title" | "dueDate" | "progress">
}

export async function fetchUserReminders(includeInactive = false) {
  try {
    const resp = await http.get<Envelope<{ reminders: ReminderWithGoal[] }>>(
      `/reminders${includeInactive ? "?includeInactive=true" : ""}`
    )
    return resp.data.data.reminders
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchReminderById(reminderId: string) {
  try {
    const resp = await http.get<Envelope<{ reminder: ReminderWithGoal }>>(
      `/reminders/${reminderId}`
    )
    return resp.data.data.reminder
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export interface CreateReminderInput {
  message: string
  goalId?: string
  remindAt: string
  recurrence?: "none" | "daily" | "weekly" | "monthly"
  reminderType?: "email" | "sms" | "app"
  endRepeat?: string
}

export async function createReminder(data: CreateReminderInput) {
  try {
    const resp = await http.post<Envelope<{ reminder: Reminder }>>(
      "/reminders",
      data
    )
    return resp.data.data.reminder
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export interface UpdateReminderInput {
  message?: string
  remindAt?: string
  recurrence?: "none" | "daily" | "weekly" | "monthly"
  reminderType?: "email" | "sms" | "app"
  isActive?: boolean
  endRepeat?: string
}

export async function updateReminder(reminderId: string, data: UpdateReminderInput) {
  try {
    const resp = await http.patch<Envelope<{ reminder: Reminder }>>(
      `/reminders/${reminderId}`,
      data
    )
    return resp.data.data.reminder
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function deleteReminder(reminderId: string) {
  try {
    await http.delete(`/reminders/${reminderId}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}