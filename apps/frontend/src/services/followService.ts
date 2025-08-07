// src/services/followService.ts
import axios from "axios"

import { http } from "@/lib/http"

/** Minimal user shape returned by the follow endpoints */
export interface FollowUser {
  id: string
  name: string
  avatarUrl?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

function handleError<T>(
  fn: string,
  error: unknown,
  fallback: ApiResponse<T>,
): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [followService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [followService::${fn}]`, error)
  }
  return fallback
}

const FollowService = {
  /** POST /follow */
  async followUser(targetUserId: string): Promise<ApiResponse<null>> {
    try {
      await http.post("/follow", { targetUserId })
      return { success: true, data: null }
    } catch (err) {
      return handleError("followUser", err, {
        success: false,
        data: null,
        message: "Failed to follow user.",
      })
    }
  },

  /** DELETE /follow/:targetUserId */
  async unfollowUser(targetUserId: string): Promise<ApiResponse<null>> {
    try {
      await http.delete(`/follow/${encodeURIComponent(targetUserId)}`)
      return { success: true, data: null }
    } catch (err) {
      return handleError("unfollowUser", err, {
        success: false,
        data: null,
        message: "Failed to unfollow user.",
      })
    }
  },

  /** GET /followers/:userId */
  async getFollowers(userId: string): Promise<ApiResponse<FollowUser[]>> {
    try {
      const resp = await http.get<FollowUser[]>(
        `/followers/${encodeURIComponent(userId)}`,
      )
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getFollowers", err, {
        success: false,
        data: [],
        message: "Failed to load followers.",
      })
    }
  },

  /** GET /following/:userId */
  async getFollowing(userId: string): Promise<ApiResponse<FollowUser[]>> {
    try {
      const resp = await http.get<FollowUser[]>(
        `/following/${encodeURIComponent(userId)}`,
      )
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getFollowing", err, {
        success: false,
        data: [],
        message: "Failed to load following list.",
      })
    }
  },
}

export default FollowService
