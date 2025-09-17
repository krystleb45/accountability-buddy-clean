import type { BadgeCreateInput } from "@/components/admin/badge-form"
import type { Envelope } from "@/types"
import type { Badge, BadgeType } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export type UserBadge = Badge & {
  badgeType: BadgeType & { iconUrl?: string }
}

export async function fetchAllBadges() {
  try {
    const resp =
      await http.get<Envelope<{ badges: BadgeType[] }>>("/badges/all")
    return resp.data.data.badges
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function createBadge(badgeData: Omit<BadgeCreateInput, "icon">) {
  try {
    const resp = await http.post<Envelope<{ badge: BadgeType }>>(
      "/badges",
      badgeData,
    )

    return resp.data.data.badge
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function uploadBadgeIcon(badgeId: string, file: File) {
  const form = new FormData()
  form.append("icon", file)

  try {
    await http.put<Envelope<undefined>>(`/badges/${badgeId}/icon`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchBadgeById(badgeId: string) {
  try {
    const resp = await http.get<Envelope<{ badge: BadgeType }>>(
      `/badges/${badgeId}`,
    )
    return resp.data.data.badge
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function updateBadge(
  badgeId: string,
  updateData: Partial<Omit<BadgeCreateInput, "icon">>,
) {
  try {
    const resp = await http.patch<Envelope<{ badge: BadgeType }>>(
      `/badges/${badgeId}`,
      updateData,
    )
    return resp.data.data.badge
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function deleteBadge(badgeId: string) {
  try {
    await http.delete<Envelope<undefined>>(`/badges/${badgeId}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchUserBadges() {
  try {
    const resp = await http.get<Envelope<{ badges: UserBadge[] }>>("/badges")

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
