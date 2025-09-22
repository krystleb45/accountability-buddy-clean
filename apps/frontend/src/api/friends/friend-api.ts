// src/friends/friendApi.ts

import axios from "axios"

import type { Envelope } from "@/types"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface UserRecommendation {
  id: string
  _id: string
  name: string
  email: string
  username: string
  profileImage: string
  interests: string[]
  mutualFriends: number
  similarityScore: number
  bio: string
  category: "fitness" | "study" | "career" | "general"
}

/**
 * Fetch the given user's friends.
 * GET /friends?userId=
 */
export async function fetchFriends(userId: string): Promise<FollowUser[]> {
  if (!userId) return []
  try {
    console.log("🔍 API: Fetching friends for userId:", userId)

    const resp = await http.get("/friends", {
      params: { userId },
    })

    console.log("📡 API: Full friends response:", resp)
    console.log("📡 API: Response data:", resp.data)

    // Handle the sendResponse format from your backend
    let friends = []

    if (resp.data) {
      if (Array.isArray(resp.data)) {
        // Direct array response
        friends = resp.data
        console.log("📦 API: Using direct array response")
      } else if (
        resp.data.success &&
        resp.data.data &&
        resp.data.data.friends
      ) {
        // sendResponse format: { success: true, data: { friends: [...] } }
        friends = resp.data.data.friends
        console.log("📦 API: Using sendResponse format with friends")
      } else if (resp.data.data && Array.isArray(resp.data.data)) {
        // sendResponse format: { success: true, data: [...] }
        friends = resp.data.data
        console.log("📦 API: Using sendResponse format with direct data array")
      } else if (resp.data.friends && Array.isArray(resp.data.friends)) {
        // Flat format: { friends: [...] }
        friends = resp.data.friends
        console.log("📦 API: Using flat friends format")
      } else {
        console.warn("⚠️ API: Unexpected friends response format:", resp.data)
        console.warn("⚠️ API: Available keys:", Object.keys(resp.data))
      }
    }

    // Transform the data to match frontend expectations
    const transformedFriends = friends.map((friend: any) => ({
      id: friend._id || friend.id, // Convert _id to id
      _id: friend._id, // Keep _id for compatibility
      username: friend.username,
      name: friend.name || friend.username, // Use name or fallback to username
      email: friend.email,
      profilePicture: friend.profilePicture,
    }))

    console.log("✅ API: Transformed friends:", transformedFriends)
    console.log("✅ API: Friends count:", transformedFriends.length)

    return transformedFriends
  } catch (error) {
    console.error("❌ [friendApi::fetchFriends] Full error:", error)
    if (axios.isAxiosError(error)) {
      console.error("❌ API: Response data:", error.response?.data)
      console.error("❌ API: Response status:", error.response?.status)
    }
    return []
  }
}

/**
 * Fetch online friends
 * GET /friends/online?limit=5
 */
export async function fetchOnlineFriends(
  userId: string,
  limit: number = 5,
): Promise<FollowUser[]> {
  if (!userId) return []

  try {
    console.log(
      "🔍 API: Fetching online friends for userId:",
      userId,
      "limit:",
      limit,
    )

    const resp = await http.get("/friends/online", {
      params: { limit },
    })

    console.log("📡 API: Online friends response:", resp.data)

    // Handle the sendResponse format from your backend
    let friends = []

    if (resp.data) {
      if (Array.isArray(resp.data)) {
        friends = resp.data
      } else if (
        resp.data.success &&
        resp.data.data &&
        resp.data.data.friends
      ) {
        friends = resp.data.data.friends
      } else if (resp.data.data && Array.isArray(resp.data.data)) {
        friends = resp.data.data
      } else if (resp.data.friends && Array.isArray(resp.data.friends)) {
        friends = resp.data.friends
      }
    }

    // Transform the results
    const transformedFriends = friends.map((friend: any) => ({
      id: friend._id || friend.id,
      _id: friend._id,
      username: friend.username,
      name: friend.name || friend.username,
      email: friend.email,
      profilePicture: friend.profilePicture,
      isOnline: friend.isOnline ?? true,
    }))

    console.log("✅ API: Online friends transformed:", transformedFriends)
    return transformedFriends
  } catch (error) {
    console.error("❌ [friendApi::fetchOnlineFriends] Error:", error)
    // Fallback to regular friends on error
    try {
      const allFriends = await fetchFriends(userId)
      return allFriends.slice(0, limit).map((friend) => ({
        ...friend,
        isOnline: true,
      }))
    } catch (fallbackError) {
      console.error(
        "❌ [friendApi::fetchOnlineFriends] Fallback also failed:",
        fallbackError,
      )
      return []
    }
  }
}

/**
 * Fetch pending friend requests for the given user.
 * GET /friends/requests?userId=
 */
export async function fetchFriendRequests(
  userId: string,
): Promise<{ id: string; sender: FollowUser }[]> {
  if (!userId) return []
  try {
    console.log("🔍 API: Fetching friend requests for userId:", userId)

    const resp = await http.get("/friends/requests", {
      params: { userId },
    })

    console.log("📡 API: Full friend requests response:", resp)
    console.log("📡 API: Response data:", resp.data)

    // Handle the sendResponse format from your backend
    let requests = []

    if (resp.data) {
      if (Array.isArray(resp.data)) {
        // Direct array response
        requests = resp.data
        console.log("📦 API: Using direct array response")
      } else if (
        resp.data.success &&
        resp.data.data &&
        resp.data.data.requests
      ) {
        // sendResponse format: { success: true, data: { requests: [...] } }
        requests = resp.data.data.requests
        console.log("📦 API: Using sendResponse format with requests")
      } else if (resp.data.data && Array.isArray(resp.data.data)) {
        // sendResponse format: { success: true, data: [...] }
        requests = resp.data.data
        console.log("📦 API: Using sendResponse format with direct data array")
      } else if (resp.data.requests && Array.isArray(resp.data.requests)) {
        // Flat format: { requests: [...] }
        requests = resp.data.requests
        console.log("📦 API: Using flat requests format")
      } else {
        console.warn(
          "⚠️ API: Unexpected friend requests response format:",
          resp.data,
        )
        console.warn("⚠️ API: Available keys:", Object.keys(resp.data))
      }
    }

    // Transform the data to match frontend expectations
    const transformedRequests = requests.map((request: any) => ({
      id: request._id, // Convert _id to id
      sender: {
        id: request.sender._id, // Convert _id to id
        _id: request.sender._id, // Keep _id for compatibility
        username: request.sender.username,
        name: request.sender.name || request.sender.username, // Use name or fallback to username
        email: request.sender.email,
        profilePicture: request.sender.profilePicture,
      },
    }))

    console.log("✅ API: Transformed friend requests:", transformedRequests)
    console.log("✅ API: Friend requests count:", transformedRequests.length)

    return transformedRequests
  } catch (error) {
    console.error("❌ [friendApi::fetchFriendRequests] Full error:", error)
    if (axios.isAxiosError(error)) {
      console.error("❌ API: Response data:", error.response?.data)
      console.error("❌ API: Response status:", error.response?.status)
    }
    return []
  }
}

/**
 * Fetch AI-recommended friends.
 * GET /friends/recommendations
 */
export async function fetchFriendSuggestions() {
  try {
    const resp = await http.get<
      Envelope<{ recommendedFriends: UserRecommendation[] }>
    >("/friends/recommendations")

    return resp.data.data.recommendedFriends
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Send a friend request.
 * POST /friends/request
 */
export async function sendFriendRequest(recipientId: string) {
  try {
    await http.post("/friends/request", { recipientId })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Accept a friend request.
 * POST /friends/accept
 */
export async function acceptFriendRequest(
  userId: string,
  requestId: string,
): Promise<boolean> {
  if (!userId || !requestId) return false
  try {
    await http.post("/friends/accept", { userId, requestId })
    return true
  } catch (error) {
    console.error("[friendApi::acceptFriendRequest]", error)
    return false
  }
}

/**
 * Decline a friend request.
 * POST /friends/decline
 */
export async function declineFriendRequest(
  userId: string,
  requestId: string,
): Promise<boolean> {
  if (!userId || !requestId) return false
  try {
    await http.post("/friends/decline", { userId, requestId })
    return true
  } catch (error) {
    console.error("[friendApi::declineFriendRequest]", error)
    return false
  }
}

/**
 * Cancel a sent friend request.
 * DELETE /friends/cancel/:requestId?userId=
 */
export async function cancelFriendRequest(
  userId: string,
  requestId: string,
): Promise<boolean> {
  if (!userId || !requestId) return false
  try {
    await http.delete(`/friends/cancel/${encodeURIComponent(requestId)}`, {
      params: { userId },
    })
    return true
  } catch (error) {
    console.error("[friendApi::cancelFriendRequest]", error)
    return false
  }
}

/**
 * Remove an existing friend.
 * DELETE /friends/remove/:friendId?userId=
 */
export async function removeFriend(
  userId: string,
  friendId: string,
): Promise<boolean> {
  if (!userId || !friendId) {
    return false
  }
  try {
    await http.delete(`/friends/remove/${encodeURIComponent(friendId)}`, {
      params: { userId },
    })
    return true
  } catch (error) {
    console.error("[friendApi::removeFriend]", error)
    return false
  }
}

export default {
  fetchFriends,
  fetchOnlineFriends, // Added the missing function
  fetchFriendRequests,
  fetchFriendSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
}
