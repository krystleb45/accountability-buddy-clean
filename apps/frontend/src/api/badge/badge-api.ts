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

export async function fetchBadgesByUsername(username: string) {
  try {
    const resp = await http.get<Envelope<{ badges: UserBadge[] }>>(
      `/badges/member/${encodeURIComponent(username)}`,
    )

    return resp.data.data.badges
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
