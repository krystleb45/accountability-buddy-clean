import { http } from "@/utils"

export interface Reminder {
  _id: string
  message: string
  remindAt: string
  reminderType: "email" | "sms" | "app"
  recurrence: "none" | "daily" | "weekly" | "monthly"
  isActive: boolean
  isSent: boolean
  goal?: {
    _id: string
    title: string
    dueDate?: string
    progress: number
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

export interface UpdateReminderInput {
  message?: string
  remindAt?: string
  recurrence?: "none" | "daily" | "weekly" | "monthly"
  reminderType?: "email" | "sms" | "app"
  isActive?: boolean
  endRepeat?: string
}

/**
 * Fetch all reminders for the current user
 */
export async function fetchUserReminders(): Promise<Reminder[]> {
  const response = await http.get("/reminders")
  
  // API returns { data: { reminders: [...] } }
  return response.data?.data?.reminders || []
}

/**
 * Fetch a single reminder by ID
 */
export async function fetchReminderById(reminderId: string): Promise<Reminder> {
  const response = await http.get(`/reminders/${reminderId}`)
  return response.data?.data?.reminder
}

/**
 * Create a new reminder
 */
export async function createReminder(data: CreateReminderInput): Promise<Reminder> {
  const response = await http.post("/reminders", data)
  return response.data?.data?.reminder
}

/**
 * Update a reminder
 */
export async function updateReminder(
  reminderId: string,
  data: UpdateReminderInput
): Promise<Reminder> {
  const response = await http.patch(`/reminders/${reminderId}`, data)
  return response.data?.data?.reminder
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  await http.delete(`/reminders/${reminderId}`)
}
