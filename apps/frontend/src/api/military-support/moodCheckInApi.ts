// FIXED: src/api/military-support/moodCheckInApi.ts

import axios from "axios"

export interface MoodCheckIn {
  mood: number // 1-5 scale
  note?: string
  sessionId: string
  timestamp: Date
}

export interface CommunityMoodData {
  averageMood: number
  totalCheckIns: number
  moodDistribution: {
    mood1: number
    mood2: number
    mood3: number
    mood4: number
    mood5: number
  }
  lastUpdated: Date
  encouragementMessage: string
}

export interface MoodTrend {
  date: string
  averageMood: number
  checkInCount: number
}

// Response wrapper for mood check-in API
interface MoodApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ✅ FIXED: Remove extra /api/ since NEXT_PUBLIC_API_URL already includes it
const MOOD_API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/anonymous-military-chat`
  : "http://localhost:5050/api/anonymous-military-chat"

function logMoodError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [moodCheckInApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [moodCheckInApi::${fn}]`, error)
  }
}

/**
 * Submit a daily mood check-in
 */
export async function submitMoodCheckIn(
  mood: number,
  note?: string,
  sessionId?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Generate session ID if not provided (must start with "anon_" for middleware)
    const anonymousSessionId =
      sessionId ||
      `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (mood < 1 || mood > 5) {
      throw new Error("Mood must be between 1 and 5")
    }

    const resp = await axios.post<MoodApiResponse<{ checkInId: string }>>(
      `${MOOD_API_BASE}/mood-checkin`,
      {
        mood,
        note: note?.trim() || null,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Anonymous-Session": anonymousSessionId,
          "X-Anonymous-Name": `Anonymous User ${Math.floor(Math.random() * 1000)}`,
        },
      },
    )

    return {
      success: true,
      message: resp.data.message || "Mood check-in submitted successfully",
    }
  } catch (err) {
    logMoodError("submitMoodCheckIn", err)

    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return {
        success: false,
        message: err.response.data.message,
      }
    }

    return {
      success: false,
      message: "Failed to submit mood check-in. Please try again.",
    }
  }
}

/**
 * Get community mood data for dashboard
 */
export async function getCommunityMoodData(): Promise<CommunityMoodData | null> {
  try {
    const resp = await axios.get<MoodApiResponse<CommunityMoodData>>(
      `${MOOD_API_BASE}/mood-trends/community`,
    )

    return {
      ...resp.data.data,
      lastUpdated: new Date(resp.data.data.lastUpdated),
    }
  } catch (err) {
    logMoodError("getCommunityMoodData", err)
    return null
  }
}

/**
 * Get mood trends over time (last 7 days)
 */
export async function getMoodTrends(days = 7): Promise<MoodTrend[]> {
  try {
    const resp = await axios.get<MoodApiResponse<{ trends: MoodTrend[] }>>(
      `${MOOD_API_BASE}/mood-trends/history?days=${days}`,
    )

    return resp.data.data.trends
  } catch (err) {
    logMoodError("getMoodTrends", err)
    return []
  }
}

/**
 * Check if user has already submitted mood check-in today
 */
export async function hasSubmittedToday(sessionId: string): Promise<boolean> {
  try {
    const resp = await axios.get<MoodApiResponse<{ hasSubmitted: boolean }>>(
      `${MOOD_API_BASE}/mood-checkin/today`,
      {
        headers: {
          "X-Anonymous-Session": sessionId,
        },
      },
    )

    return resp.data.data.hasSubmitted
  } catch (err) {
    logMoodError("hasSubmittedToday", err)
    return false // If error, assume they haven't submitted to allow check-in
  }
}

/**
 * Generate encouragement message based on mood
 */
export function getEncouragementMessage(mood: number): string {
  switch (mood) {
    case 1:
      return "Remember, you're not alone. Reach out for support when you need it."
    case 2:
      return "Tough days happen. Take it one step at a time."
    case 3:
      return "You're doing your best, and that's what matters."
    case 4:
      return "Great to hear you're doing well! Keep it up."
    case 5:
      return "Wonderful! Your positive energy helps the whole community."
    default:
      return "Thank you for sharing how you're feeling."
  }
}

/**
 * Get mood emoji and label
 */
export function getMoodDisplay(mood: number): {
  emoji: string
  label: string
  color: string
} {
  const displays = {
    1: { emoji: "😞", label: "Really struggling", color: "text-red-500" },
    2: { emoji: "😕", label: "Having a tough day", color: "text-orange-500" },
    3: { emoji: "😐", label: "Getting by", color: "text-yellow-500" },
    4: { emoji: "😊", label: "Doing well", color: "text-green-500" },
    5: { emoji: "😄", label: "Feeling great", color: "text-emerald-500" },
  }

  return displays[mood as keyof typeof displays] || displays[3]
}

// Export all functions as a single API object
export const moodCheckInApi = {
  submitMoodCheckIn,
  getCommunityMoodData,
  getMoodTrends,
  hasSubmittedToday,
  getEncouragementMessage,
  getMoodDisplay,
}

export default moodCheckInApi
