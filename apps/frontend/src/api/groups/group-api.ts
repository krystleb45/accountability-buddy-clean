import type { CreateGroupFormData } from "@/app/(authenticated)/(non-admin)/community/groups/create/client"
import type { Envelope } from "@/types"
import type { Group, Message, User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export type GroupWithCreated = Group & {
  createdBy: Pick<User, "_id" | "name" | "username" | "profileImage">
}

export type GroupMessage = Message & {
  senderId: Pick<User, "_id" | "name" | "username" | "profileImage">
  receiverId: Pick<User, "_id" | "name" | "username" | "profileImage"> | null
}

/**
 * Fetch all available groups with optional filters
 * GET /api/groups?category=...&search=...
 */
export async function fetchGroups(category?: string, search?: string) {
  try {
    const params = new URLSearchParams()
    if (category && category !== "all") {
      params.append("category", category)
    }
    if (search) {
      params.append("search", search)
    }

    const queryString = params.toString()
    const url = `/groups${queryString ? `?${queryString}` : ""}`

    const resp = await http.get<Envelope<{ groups: GroupWithCreated[] }>>(url)

    return resp.data.data.groups
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Fetch user's joined groups
 * GET /api/groups/my-groups
 */
export async function fetchMyGroups() {
  try {
    const resp =
      await http.get<Envelope<{ groups: GroupWithCreated[] }>>(
        "/groups/my-groups",
      )

    return resp.data.data.groups
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Fetch group details
 * GET /api/groups/:groupId
 */
export async function fetchGroupDetails(groupId: string) {
  try {
    const resp = await http.get<Envelope<{ group: GroupWithCreated }>>(
      `/groups/${encodeURIComponent(groupId)}`,
    )
    return resp.data.data.group
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Create a new group
 * POST /api/groups
 */
export async function createGroup(groupData: CreateGroupFormData) {
  try {
    const formData = new FormData()
    Object.entries(groupData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => formData.append(key, val))
      } else if (value instanceof File) {
        formData.append(key, value)
      } else {
        formData.append(key, String(value))
      }
    })

    const res = await http.post<Envelope<{ group: Group }>>(
      "/groups",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    )
    return res.data.data.group
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Join a group
 * POST /api/groups/:groupId/join
 */
export async function joinGroup(groupId: string) {
  try {
    await http.post(`/groups/${encodeURIComponent(groupId)}/join`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Leave a group
 * POST /api/groups/:groupId/leave
 */
export async function leaveGroup(groupId: string) {
  try {
    await http.post(`/groups/${encodeURIComponent(groupId)}/leave`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Update group details (admin only)
 * PUT /api/groups/:groupId
 */
export async function updateGroup(
  groupId: string,
  updates: Partial<Group>,
): Promise<Group | null> {
  if (!groupId) return null
  try {
    console.log(`[API] Updating group: ${groupId}`)
    const resp = await http.put(
      `/groups/${encodeURIComponent(groupId)}`,
      updates,
    )

    // Handle both Express response format and direct data
    const group = resp.data?.data || resp.data
    console.log(`[API] Updated group: ${group?.name}`)

    return group || null
  } catch (error) {
    console.error(`[API] Error updating group ${groupId}:`, error)
    return handleError("updateGroup", error, null)
  }
}

/**
 * Delete a group (admin only)
 * DELETE /api/groups/:groupId
 */
export async function deleteGroup(groupId: string): Promise<boolean> {
  if (!groupId) return false
  try {
    console.log(`[API] Deleting group: ${groupId}`)
    await http.delete(`/groups/${encodeURIComponent(groupId)}`)
    console.log(`[API] Successfully deleted group: ${groupId}`)
    return true
  } catch (error) {
    console.error(`[API] Error deleting group ${groupId}:`, error)
    return handleError("deleteGroup", error, false)
  }
}

// Member Management Functions
/**
 * Fetch group members
 * GET /api/groups/:id/members
 */
export async function fetchGroupMembers(groupId: string) {
  try {
    const resp = await http.get<
      Envelope<{
        members: Pick<User, "_id" | "name" | "username" | "profileImage">[]
      }>
    >(`/groups/${encodeURIComponent(groupId)}/members`)
    return resp.data.data.members
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Request invitation to private group
 * POST /api/groups/:groupId/request-invite
 */
export async function requestGroupInvite(groupId: string) {
  try {
    await http.post(`/groups/${encodeURIComponent(groupId)}/request-invite`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Invite a member to group
 * POST /api/groups/:id/invite
 */
export async function inviteMember(
  groupId: string,
  userId: string,
): Promise<boolean> {
  if (!groupId || !userId) return false
  try {
    console.log(`[API] Inviting user ${userId} to group ${groupId}`)
    await http.post(`/groups/${encodeURIComponent(groupId)}/invite`, {
      userId,
    })
    console.log(`[API] Successfully sent invitation`)
    return true
  } catch (error) {
    console.error(`[API] Error inviting member:`, error)
    return handleError("inviteMember", error, false)
  }
}

/**
 * Remove a member from group
 * DELETE /api/groups/:id/remove/:userId
 */
export async function removeMember(
  groupId: string,
  userId: string,
): Promise<boolean> {
  if (!groupId || !userId) return false
  try {
    console.log(`[API] Removing user ${userId} from group ${groupId}`)
    await http.delete(
      `/groups/${encodeURIComponent(groupId)}/remove/${encodeURIComponent(userId)}`,
    )
    console.log(`[API] Successfully removed member`)
    return true
  } catch (error) {
    console.error(`[API] Error removing member:`, error)
    return handleError("removeMember", error, false)
  }
}

// Message Functions
/**
 * Fetch group messages
 * GET /api/groups/:groupId/messages
 */
export async function fetchGroupMessages(groupId: string) {
  try {
    const resp = await http.get<
      Envelope<{
        messages: GroupMessage[]
        hasMore: boolean
        total: number
      }>
    >(`/groups/${encodeURIComponent(groupId)}/messages`)

    return resp.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Send a message to group
 * POST /api/groups/:groupId/messages
 */
export async function sendGroupMessage(groupId: string, content: string) {
  try {
    await http.post(`/groups/${encodeURIComponent(groupId)}/messages`, {
      content: content.trim(),
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}
