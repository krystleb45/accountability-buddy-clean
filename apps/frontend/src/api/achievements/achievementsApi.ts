// src/achievements/achievementApi.ts
// -----------------------------------------------------------------------------
// Unified HTTP client + Axios error narrowing
// -----------------------------------------------------------------------------
import axios from "axios" // for the isAxiosError type-guard only

import { http } from "@/lib/http"

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
export interface Achievement {
  featured: boolean
  id: string
  title: string
  description: string
  progress: number // 0-100
  isUnlocked: boolean
  icon?: string
}

interface SendResponse<T> {
  success: boolean
  message: string
  data: T
}

// -----------------------------------------------------------------------------
// Helper – uniform error logger
// -----------------------------------------------------------------------------
function logApiError(scope: string, error: unknown): void {
  if (axios.isAxiosError(error) && error.response) {
    console.error(`[achievementApi] ${scope}:`, error.response.data)
  } else {
    console.error(`[achievementApi] ${scope}:`, error)
  }
}

// -----------------------------------------------------------------------------
// API Functions
// -----------------------------------------------------------------------------

/**
 * Fetch the current user's achievements.
 * GET /achievements
 */
export async function fetchUserAchievements(): Promise<Achievement[]> {
  try {
    const res = await http.get<
      SendResponse<{
        achievements: Achievement[]
      }>
    >("/achievements")
    return res.data.data.achievements
  } catch (err) {
    logApiError("fetchUserAchievements", err)
    return []
  }
}

export default {
  fetchUserAchievements,
}
