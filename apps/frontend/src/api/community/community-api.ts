// src/community/communityApi.ts
// -----------------------------------------------------------------------------
// Community API hooks for interacting with community endpoints
// -----------------------------------------------------------------------------
import axios from "axios" // for error checking only

import type { Envelope } from "@/types"
import type { Group, Message, User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
export interface Community {
  _id: string
  name: string
  description: string
  topic: string
  createdAt: string
  updatedAt: string
}

// NEW: Dashboard-specific types
export interface CommunityStats {
  totalFriends: number
  activeGroups: number
  unreadMessages: number
  onlineFriends: number
}

export interface RecentMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string | undefined
  content: string
  timestamp: string
  isGroup: boolean
  groupName?: string | undefined
  isUnread?: boolean
}

export interface OnlineFriend {
  id: string
  name: string
  username: string
  avatar?: string | undefined
  status: string
  lastSeen?: string | undefined
}

interface SendResponse<T> {
  success: boolean
  message: string
  data: T
}

// -----------------------------------------------------------------------------
// Helper – uniform error logger
// -----------------------------------------------------------------------------
function logApiError(scope: string, error: unknown): void {
  if (axios.isAxiosError(error) && error.response) {
    console.error(`[communityApi] ${scope}:`, error.response.data)
  } else {
    console.error(`[communityApi] ${scope}:`, error)
  }
}

// -----------------------------------------------------------------------------
// Existing API Functions
// -----------------------------------------------------------------------------

/**
 * Fetch all public communities (chat rooms)
 * GET /communities
 */
export async function fetchPublicCommunities(): Promise<Community[]> {
  try {
    const res =
      await http.get<SendResponse<{ communities: Community[] }>>("/communities")
    return res.data.data.communities
  } catch (err) {
    logApiError("fetchPublicCommunities", err)
    return []
  }
}

/**
 * Fetch detailed info for a single community by ID
 * GET /communities/:id
 */
export async function fetchCommunityById(
  id: string,
): Promise<Community | null> {
  if (!id) {
    console.error("[communityApi::fetchCommunityById] id is required")
    return null
  }

  try {
    const res = await http.get<SendResponse<Community>>(
      `/communities/${encodeURIComponent(id)}`,
    )
    return res.data.data
  } catch (err) {
    logApiError("fetchCommunityById", err)
    return null
  }
}

// -----------------------------------------------------------------------------
// NEW: Dashboard API Functions
// -----------------------------------------------------------------------------

/**
 * Get community statistics for the dashboard
 * Aggregates data from multiple endpoints
 */
export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    const [friendsData, groupsResponse, messagesResponse] = await Promise.all([
      http.get<Envelope<{ friends: User[] }>>("/friends"),
      http.get<Envelope<Group[]>>("/groups/my-groups"),
      http.get<Envelope<{ count: number }>>("/messages/unread-count"),
    ])

    const totalFriends = friendsData.data.data.friends.length
    const onlineFriends = friendsData.data.data.friends.filter(
      (friend) => friend.activeStatus === "online",
    ).length
    const activeGroups = groupsResponse.data.data.length
    const unreadMessages = messagesResponse.data.data.count

    return { totalFriends, activeGroups, unreadMessages, onlineFriends }
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * GET /api/messages/recent
 * Get recent messages for the dashboard
 */
export async function fetchRecentMessages(limit = 5) {
  try {
    const response = await http.get<Envelope<{ messages: Message[] }>>(
      `/messages/recent`,
      {
        params: { limit },
      },
    )

    return response.data.data.messages
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * GET /api/friends/online
 * Get online friends for the dashboard
 */
export async function fetchOnlineFriends(limit: number = 5) {
  try {
    const response = await http.get<
      Envelope<{ friends: User[]; count: number }>
    >(`/friends/online`, {
      params: { limit },
    })

    return response.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

// -----------------------------------------------------------------------------
// Default Export (updated)
// -----------------------------------------------------------------------------
export default {
  // Existing functions
  fetchPublicCommunities,
  fetchCommunityById,

  // New dashboard functions
  fetchCommunityStats,
  fetchRecentMessages,
  fetchOnlineFriends,
}
