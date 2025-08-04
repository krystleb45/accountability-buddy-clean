// src/services/friendsService.ts
import axios from "axios"

import { http } from "@/utils/http"

export interface UserProfile {
  id: string
  username: string
  email?: string
  profilePicture?: string
}

export interface FriendRequestInfo {
  id: string
  sender: UserProfile
  recipient: UserProfile
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function handleError<T>(
  fn: string,
  error: unknown,
  fallback: ApiResponse<T>,
): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [friendsService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [friendsService::${fn}]`, error)
  }
  return fallback
}

const FriendsService = {
  /** POST /friends/request */
  async sendRequest(recipientId: string): Promise<ApiResponse<null>> {
    try {
      await http.post("/friends/request", { recipientId })
      return { success: true, data: null }
    } catch (err) {
      return handleError("sendRequest", err, {
        success: false,
        data: null,
        message: "Failed to send request.",
      })
    }
  },

  /** POST /friends/accept */
  async acceptRequest(requestId: string): Promise<ApiResponse<null>> {
    try {
      await http.post("/friends/accept", { requestId })
      return { success: true, data: null }
    } catch (err) {
      return handleError("acceptRequest", err, {
        success: false,
        data: null,
        message: "Failed to accept request.",
      })
    }
  },

  /** POST /friends/decline */
  async rejectRequest(requestId: string): Promise<ApiResponse<null>> {
    try {
      await http.post("/friends/decline", { requestId })
      return { success: true, data: null }
    } catch (err) {
      return handleError("rejectRequest", err, {
        success: false,
        data: null,
        message: "Failed to reject request.",
      })
    }
  },

  /** DELETE /friends/cancel/:requestId */
  async cancelRequest(requestId: string): Promise<ApiResponse<null>> {
    try {
      await http.delete(`/friends/cancel/${encodeURIComponent(requestId)}`)
      return { success: true, data: null }
    } catch (err) {
      return handleError("cancelRequest", err, {
        success: false,
        data: null,
        message: "Failed to cancel request.",
      })
    }
  },

  /** DELETE /friends/remove/:friendId */
  async removeFriend(friendId: string): Promise<ApiResponse<null>> {
    try {
      await http.delete(`/friends/remove/${encodeURIComponent(friendId)}`)
      return { success: true, data: null }
    } catch (err) {
      return handleError("removeFriend", err, {
        success: false,
        data: null,
        message: "Failed to remove friend.",
      })
    }
  },

  /** GET /friends */
  async getFriendsList(): Promise<ApiResponse<UserProfile[]>> {
    try {
      const resp = await http.get<UserProfile[]>("/friends")
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getFriendsList", err, {
        success: false,
        data: [],
        message: "Failed to load friends.",
      })
    }
  },

  /** GET /friends/requests */
  async getPendingRequests(): Promise<ApiResponse<FriendRequestInfo[]>> {
    try {
      const resp = await http.get<FriendRequestInfo[]>("/friends/requests")
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getPendingRequests", err, {
        success: false,
        data: [],
        message: "Failed to load requests.",
      })
    }
  },

  /** GET /friends/recommendations */
  async getAIRecommended(): Promise<ApiResponse<UserProfile[]>> {
    try {
      const resp = await http.get<UserProfile[]>("/friends/recommendations")
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getAIRecommended", err, {
        success: false,
        data: [],
        message: "Failed to load recommendations.",
      })
    }
  },
}

export default FriendsService
