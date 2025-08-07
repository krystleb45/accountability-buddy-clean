// src/notifications/notificationApi.ts

import axios from "axios"

import { http } from "@/lib/http"

export interface Notification {
  id: string
  title?: string
  message: string
  read: boolean
  link?: string
  createdAt: string
  [key: string]: unknown
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [notificationApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [notificationApi::${fn}]`, error)
  }
}

/** Fetch all notifications */
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const resp = await http.get<Notification[]>("/notifications")
    return resp.data
  } catch (err) {
    logError("fetchNotifications", err)
    return []
  }
}

/** Mark specific notifications as read */
export async function markNotificationsRead(ids: string[]): Promise<number> {
  try {
    const resp = await http.patch<{ updatedCount: number }>(
      "/notifications/read",
      { ids },
    )
    return resp.data.updatedCount
  } catch (err) {
    logError("markNotificationsRead", err)
    return 0
  }
}

/** Delete one notification */
export async function deleteNotification(id: string): Promise<boolean> {
  if (!id) return false
  try {
    await http.delete(`/notifications/${encodeURIComponent(id)}`)
    return true
  } catch (err) {
    logError("deleteNotification", err)
    return false
  }
}

/** Delete all notifications */
export async function clearAllNotifications(): Promise<boolean> {
  try {
    await http.delete("/notifications/delete-all")
    return true
  } catch (err) {
    logError("clearAllNotifications", err)
    return false
  }
}

/** Create a new notification (system/admin) */
export async function createNotification(
  payload: Partial<Notification>,
): Promise<Notification | null> {
  try {
    const resp = await http.post<Notification>("/notifications", payload)
    return resp.data
  } catch (err) {
    logError("createNotification", err)
    return null
  }
}

export default {
  fetchNotifications,
  markNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
}
