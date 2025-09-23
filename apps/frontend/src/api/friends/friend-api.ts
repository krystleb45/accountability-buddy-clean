import type { Envelope } from "@/types"
import type { FriendRequest, User } from "@/types/mongoose.gen"

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
 * GET /friends
 */
export async function fetchFriends() {
  try {
    const resp = await http.get<Envelope<{ friends: User[] }>>("/friends")

    return resp.data.data.friends
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
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
 * GET /friends/requests
 */
export async function fetchFriendRequests() {
  try {
    const resp =
      await http.get<
        Envelope<{ requests: (FriendRequest & { sender: User })[] }>
      >("/friends/requests")

    return resp.data.data.requests
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
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
export async function acceptFriendRequest(requestId: string) {
  try {
    await http.post("/friends/accept", { requestId })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Decline a friend request.
 * POST /friends/decline
 */
export async function declineFriendRequest(requestId: string) {
  try {
    await http.post("/friends/decline", { requestId })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
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
