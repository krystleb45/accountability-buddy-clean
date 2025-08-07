// src/users/userApi.ts

import type { AxiosResponse } from "axios"

import { http } from "@/lib/http"

// pull in your domain types from the service layer…
import type {
  Badge,
  UserBadge,
  UserCheckIn,
  UserProfile,
  UserScore,
} from "@/services/userService"

// ——————— Re-export types for consumers ————————————————————————
export type { Badge, UserBadge, UserCheckIn, UserProfile, UserScore }

// ——————— Profile ————————————————————————————————————————
/** Fetch the logged-in user’s profile */
export async function fetchUserProfile(): Promise<UserProfile> {
  const resp: AxiosResponse<UserProfile> = await http.get("/users/profile")
  return resp.data
}

/** Update the logged-in user’s profile */
export async function updateUserProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  const resp: AxiosResponse<UserProfile> = await http.put(
    "/users/profile",
    data,
  )
  return resp.data
}

/** List all users (admin) */
export async function fetchUsers(): Promise<UserProfile[]> {
  const resp: AxiosResponse<UserProfile[]> = await http.get("/users/all")
  return resp.data
}

/** Block/unblock a user (admin) */
export async function blockUser(userId: string): Promise<void> {
  await http.post(`/users/${encodeURIComponent(userId)}/block`)
}
export async function unblockUser(userId: string): Promise<void> {
  await http.post(`/users/${encodeURIComponent(userId)}/unblock`)
}

// ——————— Badges ————————————————————————————————————————
export async function fetchBadges(): Promise<Badge[]> {
  const resp: AxiosResponse<Badge[]> = await http.get("/users/badges")
  return resp.data
}
export async function fetchBadgesForUser(userId: string): Promise<UserBadge[]> {
  const resp: AxiosResponse<UserBadge[]> = await http.get(
    `/users/${encodeURIComponent(userId)}/badges`,
  )
  return resp.data
}
export async function awardBadgeToUser(
  userId: string,
  badgeId: string,
): Promise<UserBadge> {
  const resp: AxiosResponse<UserBadge> = await http.post(
    "/users/badges/award",
    {
      userId,
      badgeId,
    },
  )
  return resp.data
}

// ——————— Leaderboard —————————————————————————————————————
export async function fetchUserLeaderboard(): Promise<UserScore[]> {
  const resp: AxiosResponse<UserScore[]> = await http.get("/users/leaderboard")
  return resp.data
}

// ——————— Check-in ————————————————————————————————————————
export async function getLastCheckIn(): Promise<UserCheckIn> {
  const resp: AxiosResponse<UserCheckIn> = await http.get(
    "/users/check-in/last",
  )
  return resp.data
}
export async function logUserCheckIn(): Promise<UserCheckIn> {
  const resp: AxiosResponse<UserCheckIn> = await http.post("/users/check-in")
  return resp.data
}

// ——————— Points ————————————————————————————————————————
// Fetch the current user’s point total (no userId param, derives from session)
export async function getUserPoints(): Promise<number> {
  const resp: AxiosResponse<{ points: number }> =
    await http.get("/users/points")
  return resp.data.points
}

// (Optional) if you still want to expose granular userId-based endpoints:
// export async function fetchUserPointsById(userId: string): Promise<number> { … }
// export async function postUserPoints(userId: string): Promise<number> { … }
// export async function deleteUserPoints(userId: string): Promise<void> { … }

// ——————— Default export for convenience —————————————————————
export default {
  fetchUserProfile,
  updateUserProfile,
  fetchUsers,
  blockUser,
  unblockUser,

  fetchBadges,
  fetchBadgesForUser,
  awardBadgeToUser,

  fetchUserLeaderboard,

  getLastCheckIn,
  logUserCheckIn,

  getUserPoints,
}
