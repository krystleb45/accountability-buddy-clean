// src/services/groupService.ts
import axios from "axios"

import { http } from "@/lib/http"

export interface Group {
  id: string
  name: string
  inviteOnly?: boolean
  description?: string
  interests: string[]
  createdBy: string
  members?: number
  createdAt?: string
  updatedAt?: string
}

// ─── New: shape of a chat message in a group
export interface GroupMessage {
  id: string
  sender: { id: string; name: string }
  content: string
  timestamp: string
}

export interface Challenge {
  id: string
  question?: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  progress: number
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
      `❌ [groupService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [groupService::${fn}]`, error)
  }
  return fallback
}

const GroupService = {
  /** POST /group/create */
  async createGroup(
    name: string,
    interests: string[],
  ): Promise<ApiResponse<Group>> {
    try {
      const resp = await http.post<Group>("/group/create", { name, interests })
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("createGroup", err, {
        success: false,
        data: {} as Group,
        message: "Failed to create group.",
      })
    }
  },

  /** POST /group/join */
  async joinGroup(groupId: string): Promise<ApiResponse<null>> {
    try {
      await http.post("/group/join", { groupId })
      return { success: true, data: null }
    } catch (err) {
      return handleError("joinGroup", err, {
        success: false,
        data: null,
        message: "Failed to join group.",
      })
    }
  },

  /** POST /group/leave */
  async leaveGroup(groupId: string): Promise<ApiResponse<null>> {
    try {
      await http.post("/group/leave", { groupId })
      return { success: true, data: null }
    } catch (err) {
      return handleError("leaveGroup", err, {
        success: false,
        data: null,
        message: "Failed to leave group.",
      })
    }
  },

  /** GET /group/my-groups */
  async getUserGroups(): Promise<ApiResponse<Group[]>> {
    try {
      const resp = await http.get<Group[]>("/group/my-groups")
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getUserGroups", err, {
        success: false,
        data: [],
        message: "Failed to load your groups.",
      })
    }
  },

  /** Convenience: return just the array */
  async fetchGroups(): Promise<Group[]> {
    const resp = await this.getUserGroups()
    return resp.success ? resp.data : []
  },

  /** GET /group/unread-counts */
  async fetchUnreadCounts(): Promise<Record<string, number>> {
    try {
      const resp = await http.get<Record<string, number>>(
        "/group/unread-counts",
      )
      return resp.data
    } catch (err) {
      console.error("[groupService::fetchUnreadCounts]", err)
      return {}
    }
  },

  /** POST /group/clear-unread */
  async clearUnreadCount(groupId: string): Promise<void> {
    try {
      await http.post("/group/clear-unread", { groupId })
    } catch (err) {
      console.error("[groupService::clearUnreadCount]", err)
    }
  },

  /** GET /group/:groupId/challenges */
  async fetchChallenges(groupId: string): Promise<Challenge[]> {
    try {
      const resp = await http.get<Challenge[]>(`/group/${groupId}/challenges`)
      return resp.data
    } catch (err) {
      console.error("[groupService::fetchChallenges]", err)
      return []
    }
  },

  /** GET /group/:groupId/challenges/:challengeId/leaderboard */
  async fetchLeaderboard(
    groupId: string,
    challengeId: string,
  ): Promise<LeaderboardEntry[]> {
    try {
      const resp = await http.get<LeaderboardEntry[]>(
        `/group/${groupId}/challenges/${challengeId}/leaderboard`,
      )
      return resp.data
    } catch (err) {
      console.error("[groupService::fetchLeaderboard]", err)
      return []
    }
  },

  /** GET /group/:groupId */
  async getGroupById(groupId: string): Promise<ApiResponse<Group>> {
    try {
      const resp = await http.get<Group>(`/group/${groupId}`)
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("getGroupById", err, {
        success: false,
        data: {} as Group,
        message: "Failed to retrieve group.",
      })
    }
  },

  // ─── NEW: chat endpoints ─────────────────────────────────────────

  /** GET /group/:groupId/messages */
  async fetchGroupMessages(
    groupId: string,
  ): Promise<ApiResponse<GroupMessage[]>> {
    try {
      const resp = await http.get<ApiResponse<GroupMessage[]>>(
        `/group/${groupId}/messages`,
      )
      return resp.data
    } catch (err) {
      return handleError("fetchGroupMessages", err, {
        success: false,
        data: [],
        message: "Failed to load messages.",
      })
    }
  },

  /** POST /group/:groupId/messages */
  async sendGroupMessage(
    groupId: string,
    content: string,
  ): Promise<ApiResponse<GroupMessage>> {
    try {
      const resp = await http.post<ApiResponse<GroupMessage>>(
        `/group/${groupId}/messages`,
        { content },
      )
      return resp.data
    } catch (err) {
      return handleError("sendGroupMessage", err, {
        success: false,
        data: {} as GroupMessage,
        message: "Failed to send message.",
      })
    }
  },
}

export default GroupService
