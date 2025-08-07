// src/services/notificationTriggerService.ts
import { http } from "@/lib/http"

interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface DailyStreakPayload {
  userId: string
}

export interface LevelUpPayload {
  userId: string
  level: number
}

export interface BadgeUnlockPayload {
  userId: string
  badgeName: string
}

export interface EmailPayload {
  email: string
  subject: string
  text: string
}

const NotificationTriggerService = {
  /** POST /notifications/daily-streak-reminder */
  async sendDailyStreakReminder(userId: string): Promise<void> {
    try {
      await http.post<ApiResponse>("/notifications/daily-streak-reminder", {
        userId,
      })
    } catch (err) {
      console.error(
        "[NotificationTriggerService.sendDailyStreakReminder] ",
        err,
      )
      throw new Error("Failed to send daily streak reminder.")
    }
  },

  /** POST /notifications/level-up */
  async sendLevelUpNotification(userId: string, level: number): Promise<void> {
    try {
      await http.post<ApiResponse>("/notifications/level-up", { userId, level })
    } catch (err) {
      console.error(
        "[NotificationTriggerService.sendLevelUpNotification] ",
        err,
      )
      throw new Error("Failed to send level-up notification.")
    }
  },

  /** POST /notifications/badge-unlock */
  async sendBadgeUnlockNotification(
    userId: string,
    badgeName: string,
  ): Promise<void> {
    try {
      await http.post<ApiResponse>("/notifications/badge-unlock", {
        userId,
        badgeName,
      })
    } catch (err) {
      console.error(
        "[NotificationTriggerService.sendBadgeUnlockNotification] ",
        err,
      )
      throw new Error("Failed to send badge-unlock notification.")
    }
  },

  /** POST /notifications/email */
  async sendCustomEmail(
    email: string,
    subject: string,
    text: string,
  ): Promise<void> {
    try {
      await http.post<ApiResponse>("/notifications/email", {
        email,
        subject,
        text,
      })
    } catch (err) {
      console.error("[NotificationTriggerService.sendCustomEmail] ", err)
      throw new Error("Failed to send email notification.")
    }
  },
}

export default NotificationTriggerService
