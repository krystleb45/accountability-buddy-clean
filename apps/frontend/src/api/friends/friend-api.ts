import type { Category } from "@ab/shared/categories"

import type { Envelope } from "@/types"
import type { Chat, FriendRequest, Message, User } from "@/types/mongoose.gen"

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
  category: Category
}

/**
 * Fetch the given user's friends.
 * GET /api/friends
 */
export async function fetchFriends() {
  try {
    const resp =
      await http.get<Envelope<{ friends: (User & { canDm: boolean })[] }>>(
        "/friends",
      )

    return resp.data.data.friends
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Fetch pending friend requests for the given user.
 * GET /api/friends/requests
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
 * GET /api/friends/recommendations
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
 * POST /api/friends/request
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
 * POST /api/friends/accept
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
 * POST /api/friends/decline
 */
export async function declineFriendRequest(requestId: string) {
  try {
    await http.post("/friends/decline", { requestId })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

export type DmMessage = Message & {
  senderId: Pick<User, "_id" | "name" | "username" | "profileImage">
  receiverId: Pick<User, "_id" | "name" | "username" | "profileImage"> | null
}

/**
 * GET /api/friends/:friendId/messages
 * Get direct messages with a friend
 */
export async function fetchDirectMessages(
  friendId: string,
  page?: number,
  limit?: number,
) {
  try {
    const resp = await http.get<
      Envelope<{ messages: { messages: DmMessage[] }; chat: Chat }>
    >(`/friends/${friendId}/messages`, { params: { page, limit } })

    return resp.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * POST /api/friends/:friendId/message
 * Send a direct message to a friend
 */
export async function sendDirectMessage(friendId: string, message: string) {
  try {
    await http.post(`/friends/${friendId}/message`, { message })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}
