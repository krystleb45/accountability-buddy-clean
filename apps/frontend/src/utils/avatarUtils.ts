// src/utils/avatarUtils.ts

import type { LeaderboardEntry } from "@/types/Gamification.types"
import type { UserProfile } from "@/types/User.types"

/**
 * A flexible type for any user-like object with potential avatar + name fields
 */
type AvatarUser = Partial<Pick<UserProfile, "avatarUrl" | "fullName">> &
  Partial<Pick<LeaderboardEntry, "avatarUrl" | "displayName">>

/**
 * Returns the avatar URL from various user types, with a customizable fallback.
 *
 * @param user - Object containing possible avatarUrl.
 * @param fallback - URL to use if no valid avatarUrl is present.
 * @returns A string URL for the avatar.
 */
export function getAvatarUrl(
  user: AvatarUser,
  fallback = "/default-avatar.png",
): string {
  const url = user.avatarUrl?.trim()
  return url && url !== "" ? url : fallback
}

/**
 * Returns initials for the user (based on fullName or displayName), up to 3 letters.
 *
 * @param user - Object containing fullName or displayName.
 * @returns A string of initials (empty string if no name).
 */
export function getInitials(user: AvatarUser): string {
  const rawName = user.fullName || user.displayName || ""
  const words = rawName.trim().split(/\s+/)
  if (words.length === 0 || !words[0]) return ""
  // Take first letter of up to first three words
  return words
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 3)
    .join("")
    .toUpperCase()
}
