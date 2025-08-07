// src/community/communityApi.ts
// -----------------------------------------------------------------------------
// Community API hooks for interacting with community endpoints
// -----------------------------------------------------------------------------
import axios from "axios" // for error checking only

import { http } from "@/lib/http"

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
    console.log("📊 [communityApi] Fetching community stats...")

    // Use your existing proxy routes (remove /api/ prefix)
    const [friendsResponse, groupsResponse, messagesResponse] =
      await Promise.allSettled([
        http.get("/friends"),
        http.get("/groups/my-groups"),
        http.get("/messages/unread-count"), // Use your existing route
      ])

    let totalFriends = 0
    let activeGroups = 0
    let unreadMessages = 0
    let onlineFriends = 0

    // Process friends response
    if (friendsResponse.status === "fulfilled") {
      const friendsData = friendsResponse.value.data
      console.log("👥 [communityApi] Friends response:", friendsData)

      if (Array.isArray(friendsData)) {
        totalFriends = friendsData.length
        onlineFriends = friendsData.filter(
          (friend: any) => friend.activeStatus === "online",
        ).length
      } else if (friendsData?.data?.friends) {
        totalFriends = friendsData.data.friends.length
        onlineFriends = friendsData.data.friends.filter(
          (friend: any) => friend.activeStatus === "online",
        ).length
      } else if (friendsData?.friends) {
        totalFriends = friendsData.friends.length
        onlineFriends = friendsData.friends.filter(
          (friend: any) => friend.activeStatus === "online",
        ).length
      }
    } else {
      logApiError("fetchCommunityStats - friends", friendsResponse.reason)
    }

    // Process groups response
    if (groupsResponse.status === "fulfilled") {
      const groupsData = groupsResponse.value.data
      console.log("🎯 [communityApi] Groups response:", groupsData)

      if (Array.isArray(groupsData)) {
        activeGroups = groupsData.length
      } else if (groupsData?.data?.groups) {
        activeGroups = groupsData.data.groups.length
      } else if (groupsData?.groups) {
        activeGroups = groupsData.groups.length
      }
    } else {
      logApiError("fetchCommunityStats - groups", groupsResponse.reason)
    }

    // Process messages response - updated for your unread-count endpoint
    if (messagesResponse.status === "fulfilled") {
      const messagesData = messagesResponse.value.data
      console.log("💬 [communityApi] Messages response:", messagesData)

      // Handle various response formats from your unread-count endpoint
      if (typeof messagesData === "number") {
        unreadMessages = messagesData
      } else if (messagesData?.data?.count !== undefined) {
        unreadMessages = messagesData.data.count
      } else if (messagesData?.count !== undefined) {
        unreadMessages = messagesData.count
      } else if (messagesData?.unreadCount !== undefined) {
        unreadMessages = messagesData.unreadCount
      }
    } else {
      logApiError("fetchCommunityStats - messages", messagesResponse.reason)
    }

    const stats = { totalFriends, activeGroups, unreadMessages, onlineFriends }
    console.log("✅ [communityApi] Community stats loaded:", stats)
    return stats
  } catch (error) {
    logApiError("fetchCommunityStats", error)
    return {
      totalFriends: 0,
      activeGroups: 0,
      unreadMessages: 0,
      onlineFriends: 0,
    }
  }
}

/**
 * Get recent messages for the dashboard
 * GET /api/messages/recent (uses your existing proxy route)
 */
export async function fetchRecentMessages(
  limit: number = 5,
): Promise<RecentMessage[]> {
  try {
    console.log("💬 [communityApi] Fetching recent messages...")

    // Use your existing proxy route (remove /api/ prefix)
    const response = await http.get(`/messages/recent?limit=${limit}`)

    console.log("💬 [communityApi] Recent messages response:", response.data)

    let messages = []
    if (Array.isArray(response.data)) {
      messages = response.data
    } else if (response.data?.data?.messages) {
      messages = response.data.data.messages
    } else if (response.data?.messages) {
      messages = response.data.messages
    }

    // Transform to RecentMessage format, handling optional properties properly
    const recentMessages: RecentMessage[] = messages.map((message: any) => {
      const recentMessage: RecentMessage = {
        id: message._id || message.id,
        senderId: message.senderId || message.sender?._id,
        senderName: message.senderName || message.sender?.name,
        content: message.content,
        timestamp: message.createdAt || message.timestamp,
        isGroup: message.messageType === "group" || Boolean(message.group),
        isUnread: message.readBy?.length === 0 || !message.isRead,
      }

      // Only add optional properties if they have values
      if (message.senderAvatar || message.sender?.avatar) {
        recentMessage.senderAvatar =
          message.senderAvatar || message.sender?.avatar
      }

      if (message.groupName || message.group?.name) {
        recentMessage.groupName = message.groupName || message.group?.name
      }

      return recentMessage
    })

    console.log(
      "✅ [communityApi] Recent messages loaded:",
      recentMessages.length,
    )
    return recentMessages
  } catch (error) {
    logApiError("fetchRecentMessages", error)
    return []
  }
}

/**
 * Get online friends for the dashboard
 * GET /api/friends/online (will need to create this proxy route)
 */
export async function fetchOnlineFriends(
  limit: number = 5,
): Promise<OnlineFriend[]> {
  try {
    console.log("🟢 [communityApi] Fetching online friends...")

    // Use proxy route for consistency (remove /api/ prefix)
    const response = await http.get(`/friends/online?limit=${limit}`)

    console.log("🟢 [communityApi] Online friends response:", response.data)

    let onlineFriends = []
    if (Array.isArray(response.data)) {
      onlineFriends = response.data
    } else if (response.data?.data?.friends) {
      onlineFriends = response.data.data.friends
    } else if (response.data?.friends) {
      onlineFriends = response.data.friends
    }

    // Transform to OnlineFriend format, handling optional properties properly
    const transformedFriends: OnlineFriend[] = onlineFriends.map(
      (friend: any) => {
        const onlineFriend: OnlineFriend = {
          id: friend._id || friend.id,
          name: friend.name,
          username: friend.username || friend.name,
          status: friend.status || friend.activeStatus || "Available",
        }

        // Only add optional properties if they have values
        if (friend.avatar) {
          onlineFriend.avatar = friend.avatar
        }

        if (friend.lastSeen) {
          onlineFriend.lastSeen = friend.lastSeen
        }

        return onlineFriend
      },
    )

    console.log(
      "✅ [communityApi] Online friends loaded:",
      transformedFriends.length,
    )
    return transformedFriends
  } catch (error) {
    logApiError("fetchOnlineFriends", error)
    return []
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
