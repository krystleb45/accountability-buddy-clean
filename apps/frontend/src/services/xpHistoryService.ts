// src/services/xpHistoryService.ts
import { http } from "@/lib/http"

export interface XpEntry {
  id: string
  xp: number
  reason: string
  date: string
}

interface ApiResponse<T> {
  success: boolean
  entry?: T
  entries?: T[]
  message?: string
}

const XpHistoryService = {
  /** POST /xp-history */
  async recordXp(xp: number, reason: string): Promise<XpEntry> {
    const resp = await http.post<ApiResponse<XpEntry>>("/xp-history", {
      xp,
      reason,
    })
    if (!resp.data.success || !resp.data.entry) {
      throw new Error(resp.data.message ?? "Failed to record XP")
    }
    return resp.data.entry
  },

  /** GET /xp-history */
  async fetchMyHistory(): Promise<XpEntry[]> {
    const resp = await http.get<ApiResponse<XpEntry>>("/xp-history")
    if (!resp.data.success) {
      throw new Error(resp.data.message ?? "Failed to fetch XP history")
    }
    // `entries` is an array of XpEntry
    return resp.data.entries ?? []
  },

  /** GET /xp-history/all */
  async fetchAllHistory(): Promise<XpEntry[]> {
    const resp = await http.get<ApiResponse<XpEntry>>("/xp-history/all")
    if (!resp.data.success) {
      throw new Error(resp.data.message ?? "Failed to fetch all XP history")
    }
    return resp.data.entries ?? []
  },
}

export default XpHistoryService
