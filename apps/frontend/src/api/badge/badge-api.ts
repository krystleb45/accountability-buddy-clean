import type { Envelope } from "@/types"
import type { Badge } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export async function fetchUserBadges() {
  try {
    const resp = await http.get<Envelope<{ badges: Badge[] }>>("/badges")

    if (!resp.data.success) {
      console.warn(
        "[badgeApi] fetchUserBadges returned success=false:",
        resp.data.message,
      )
      return []
    }
    return resp.data.data.badges
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchShowcasedBadges() {
  try {
    const resp =
      await http.get<Envelope<{ showcasedBadges: Badge[] }>>("/badges/showcase")

    if (!resp.data.success) {
      console.warn(
        "[badgeApi] fetchShowcasedBadges returned success=false:",
        resp.data.message,
      )
      return []
    }
    return resp.data.data.showcasedBadges
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function awardBadge(
  userId: string,
  badgeType: string,
  level: "Bronze" | "Silver" | "Gold" = "Bronze",
) {
  try {
    const resp = await http.post<Envelope<{ badge: Badge }>>("/badges/award", {
      userId,
      badgeType,
      level,
    })

    if (!resp.data.success) {
      return null
    }
    return resp.data.data.badge
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function updateBadgeProgress(
  badgeType: string,
  increment: number,
) {
  try {
    const resp = await http.post<Envelope<{ badge: Badge }>>(
      "/badges/progress/update",
      { badgeType, increment },
    )

    if (!resp.data.success) {
      return null
    }
    return resp.data.data.badge
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export default {
  fetchUserBadges,
  fetchShowcasedBadges,
  awardBadge,
  updateBadgeProgress,
}
