import type { Envelope } from "@/types"
import type { Group, Message, User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

// NEW: Dashboard-specific types
interface CommunityStats {
  totalFriends: number
  activeGroups: number
  unreadMessages: number
  onlineFriends: number
}

/**
 * Get community statistics for the dashboard
 * Aggregates data from multiple endpoints
 */
export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    const [friendsData, groupsResponse, messagesResponse] = await Promise.all([
      http.get<Envelope<{ friends: User[] }>>("/friends"),
      http.get<Envelope<{ groups: Group[] }>>("/groups/my-groups"),
      http.get<Envelope<{ count: number }>>("/messages/unread-count"),
    ])

    const totalFriends = friendsData.data.data.friends.length
    const onlineFriends = friendsData.data.data.friends.filter(
      (friend) => friend.activeStatus === "online",
    ).length
    const activeGroups = groupsResponse.data.data.groups.length
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
