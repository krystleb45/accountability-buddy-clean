// src/notification-trigger/notificationTriggerApi.ts

import axios from "axios"

import { http } from "@/utils/http"

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [notificationTriggerApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [notificationTriggerApi::${fn}]`, error)
  }
}

/** Trigger daily streak reminder */
export async function triggerDailyStreakReminder(
  userId: string,
): Promise<boolean> {
  if (!userId) return false
  try {
    await http.post("/notifications/daily-streak-reminder", { userId })
    return true
  } catch (err) {
    logError("triggerDailyStreakReminder", err)
    return false
  }
}

/** Trigger level-up notification */
export async function triggerLevelUpNotification(
  userId: string,
  level: number,
): Promise<boolean> {
  if (!userId) return false
  try {
    await http.post("/notifications/level-up", { userId, level })
    return true
  } catch (err) {
    logError("triggerLevelUpNotification", err)
    return false
  }
}

/** Trigger badge-unlock notification */
export async function triggerBadgeUnlockNotification(
  userId: string,
  badgeName: string,
): Promise<boolean> {
  if (!userId || !badgeName) return false
  try {
    await http.post("/notifications/badge-unlock", { userId, badgeName })
    return true
  } catch (err) {
    logError("triggerBadgeUnlockNotification", err)
    return false
  }
}

/** Send a custom email notification */
export async function sendCustomEmailNotification(
  email: string,
  subject: string,
  text: string,
): Promise<boolean> {
  if (!email.trim() || !subject.trim() || !text.trim()) return false
  try {
    await http.post("/notifications/email", { email, subject, text })
    return true
  } catch (err) {
    logError("sendCustomEmailNotification", err)
    return false
  }
}

export default {
  triggerDailyStreakReminder,
  triggerLevelUpNotification,
  triggerBadgeUnlockNotification,
  sendCustomEmailNotification,
}
