// src/api/settings/settingsApi.ts

import axios from "axios"

import { http } from "@/lib/http"

export interface UserSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications?: boolean
  theme?: "light" | "dark"
  language?: "en" | "es" | "fr" | "de" | "zh"
  [key: string]: unknown
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [settingsApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [settingsApi::${fn}]`, error)
  }
}

/** GET /settings */
export async function fetchSettings(): Promise<UserSettings | null> {
  try {
    const resp = await http.get<UserSettings>("/settings")
    return resp.data
  } catch (err) {
    logError("fetchSettings", err)
    return null
  }
}

/** PUT /settings/update */
export async function saveSettings(
  settings: Partial<UserSettings>,
): Promise<UserSettings | null> {
  try {
    // NOTE → “/settings/update” (not just “/settings”)
    const resp = await http.put<UserSettings>("/settings/update", settings)
    return resp.data
  } catch (err) {
    logError("saveSettings", err)
    return null
  }
}

/** PUT /settings/password */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  try {
    const resp = await http.put<{ success: boolean; message?: string }>(
      "/settings/password",
      { currentPassword, newPassword },
    )
    return resp.data.success
  } catch (err) {
    logError("changePassword", err)
    return false
  }
}

/** PUT /settings/notifications */
export async function saveNotificationPrefs(
  prefs: Partial<
    Pick<
      UserSettings,
      "emailNotifications" | "smsNotifications" | "pushNotifications"
    >
  >,
): Promise<UserSettings | null> {
  try {
    const resp = await http.put<UserSettings>("/settings/notifications", prefs)
    return resp.data
  } catch (err) {
    logError("saveNotificationPrefs", err)
    return null
  }
}

/** DELETE /settings/account */
export async function deleteAccount(): Promise<boolean> {
  try {
    await http.delete("/settings/account")
    return true
  } catch (err) {
    logError("deleteAccount", err)
    return false
  }
}

export default {
  fetchSettings,
  saveSettings,
  changePassword,
  saveNotificationPrefs,
  deleteAccount,
}
