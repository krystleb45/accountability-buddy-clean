// src/api/users/userService.ts
import type { AxiosResponse } from "axios"

import axios from "axios"

import { http } from "@/lib/http"

export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  role?: string
  avatarUrl?: string
  isActive?: boolean
  joinedAt?: string
  metadata?: Record<string, unknown>
}

export interface UserBadge {
  id: string
  badgeId: string
  userId: string
  earnedAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon?: string
  criteria: "messages" | "reactions" | "challenges"
  threshold: number
}

export interface UserScore {
  userId: string
  username: string
  points: number
}

export interface UserCheckIn {
  userId: string
  lastCheckIn: string
  streak: number
}

export type UserAction = "block" | "unblock"

interface ApiErrorResponse {
  message: string
}

/** Retry helper for AxiosResponse<T> */
async function axiosRetry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isServerErr =
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500
      if (isServerErr && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
        attempt++
        continue
      }
      throw err
    }
  }
  throw new Error("Failed after multiple retries.")
}

const UserService = {
  /** GET /users/profile */
  async fetchProfile(): Promise<UserProfile> {
    const { data } = await axiosRetry(() =>
      http.get<UserProfile>("/users/profile"),
    )
    return data
  },

  /** PUT /users/profile */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!Object.keys(updates).length) {
      throw new Error("No profile data provided")
    }
    const { data } = await axiosRetry(() =>
      http.put<UserProfile>("/users/profile", updates),
    )
    return data
  },

  /** GET /users/all */
  async fetchAll(): Promise<UserProfile[]> {
    const { data } = await axiosRetry(() =>
      http.get<UserProfile[]>("/users/all"),
    )
    return data
  },

  /** POST /users/:id/block or unblock */
  async toggleStatus(userId: string, action: UserAction): Promise<void> {
    if (!userId || !["block", "unblock"].includes(action)) {
      throw new Error("Action must be 'block' or 'unblock'")
    }
    await axiosRetry(() => http.post(`/users/${userId}/${action}`))
  },

  /** GET /users/badges */
  async fetchBadges(): Promise<Badge[]> {
    const { data } = await axiosRetry(() => http.get<Badge[]>("/users/badges"))
    return data
  },

  /** GET /users/:id/badges */
  async fetchUserBadges(userId: string): Promise<UserBadge[]> {
    if (!userId) throw new Error("User ID is required")
    const { data } = await axiosRetry(() =>
      http.get<UserBadge[]>(`/users/${userId}/badges`),
    )
    return data
  },

  /** POST /users/badges/award */
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    if (!userId || !badgeId) {
      throw new Error("User ID and badge ID are required")
    }
    const { data } = await axiosRetry(() =>
      http.post<UserBadge>("/users/badges/award", { userId, badgeId }),
    )
    return data
  },

  /** GET /users/leaderboard */
  async fetchLeaderboard(): Promise<UserScore[]> {
    const { data } = await axiosRetry(() =>
      http.get<UserScore[]>("/users/leaderboard"),
    )
    return data
  },

  /** POST /users/:id/points */
  async updatePoints(userId: string, points: number): Promise<void> {
    if (!userId || points < 0) {
      throw new Error("Invalid user ID or points")
    }
    await axiosRetry(() => http.post(`/users/${userId}/points`, { points }))
  },

  /** GET /users/check-in/last */
  async getLastCheckIn(): Promise<UserCheckIn> {
    try {
      const { data } = await axiosRetry(() =>
        http.get<UserCheckIn>("/users/check-in/last"),
      )
      return data
    } catch {
      return { userId: "", lastCheckIn: "", streak: 0 }
    }
  },

  /** POST /users/check-in */
  async logCheckIn(): Promise<UserCheckIn> {
    const { data } = await axiosRetry(() =>
      http.post<UserCheckIn>("/users/check-in"),
    )
    return data
  },

  /** Helper to get avatar or default */
  async getAvatar(): Promise<string> {
    try {
      const profile = await this.fetchProfile()
      return profile.avatarUrl || "/default-avatar.png"
    } catch {
      return "/default-avatar.png"
    }
  },
}

export default UserService
