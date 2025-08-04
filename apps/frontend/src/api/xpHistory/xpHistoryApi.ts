// src/xpHistory/xpHistoryApi.ts

import type { AxiosResponse } from "axios"

import type { XpEntry } from "@/services/xpHistoryService"

import { http } from "@/utils/http"

interface ApiResponse<T> {
  success: boolean
  entry?: T
  entries?: T[]
  message?: string
}

/** Record a new XP entry */
export async function postXpEntry(
  xp: number,
  reason: string,
): Promise<XpEntry> {
  const resp: AxiosResponse<ApiResponse<XpEntry>> = await http.post(
    "/xp-history",
    { xp, reason },
  )
  if (!resp.data.success || !resp.data.entry) {
    throw new Error(resp.data.message ?? "Failed to record XP")
  }
  return resp.data.entry
}

/** Fetch my XP history */
export async function getMyXpHistory(): Promise<XpEntry[]> {
  const resp: AxiosResponse<ApiResponse<XpEntry>> =
    await http.get("/xp-history")
  if (!resp.data.success) {
    throw new Error(resp.data.message ?? "Failed to fetch XP history")
  }
  return resp.data.entries ?? []
}

/** (Admin) Fetch all XP history */
export async function getAllXpHistory(): Promise<XpEntry[]> {
  const resp: AxiosResponse<ApiResponse<XpEntry>> =
    await http.get("/xp-history/all")
  if (!resp.data.success) {
    throw new Error(resp.data.message ?? "Failed to fetch all XP history")
  }
  return resp.data.entries ?? []
}

export default {
  postXpEntry,
  getMyXpHistory,
  getAllXpHistory,
}
