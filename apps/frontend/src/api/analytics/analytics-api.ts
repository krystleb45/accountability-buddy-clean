import type { Envelope } from "@/types"

import { getApiErrorMessage, http } from "@/utils"

export interface AdvancedAnalyticsData {
  goalTrends: Record<string, number>
  categoryBreakdown: Record<string, number>
}

/**
 * GET /api/analytics/advanced
 */
export async function getAdvancedAnalytics() {
  try {
    const res = await http.get<Envelope<AdvancedAnalyticsData>>(
      "/analytics/advanced",
    )
    return res.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}
