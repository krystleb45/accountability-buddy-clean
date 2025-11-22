import type { Envelope } from "@/types"

import { getApiErrorMessage, http } from "@/utils"

interface CommunityMoodData {
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

interface MoodTrend {
  date: string
  averageMood: number
  checkInCount: number
}

/**
 * Submit a daily mood check-in
 */
export async function submitMoodCheckIn(
  mood: number,
  note?: string,
  sessionId?: string,
) {
  try {
    // Generate session ID if not provided (must start with "anon_" for middleware)
    const anonymousSessionId =
      sessionId ||
      `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    await http.post(
      "/anonymous-military-chat/mood-checkin",
      {
        mood,
        note: note?.trim() || undefined,
      },
      {
        headers: {
          "X-Anonymous-Session": anonymousSessionId,
        },
      },
    )
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Get community mood data for dashboard
 */
export async function getCommunityMoodData() {
  try {
    const resp = await http.get<Envelope<CommunityMoodData>>(
      "/anonymous-military-chat/mood-trends/community",
    )

    return {
      ...resp.data.data,
      lastUpdated: new Date(resp.data.data.lastUpdated),
    }
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Get mood trends over time (last 7 days)
 */
export async function getMoodTrends(days = 7) {
  try {
    const resp = await http.get<Envelope<{ trends: MoodTrend[] }>>(
      "/anonymous-military-chat/mood-trends/history",
      {
        params: { days },
      },
    )

    return resp.data.data.trends
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Check if user has already submitted mood check-in today
 */
export async function hasSubmittedToday(sessionId: string) {
  try {
    const resp = await http.get<Envelope<{ hasSubmitted: boolean }>>(
      `/anonymous-military-chat/mood-checkin/today`,
      {
        headers: {
          "X-Anonymous-Session": sessionId,
        },
      },
    )

    return resp.data.data.hasSubmitted
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
