import type { CreateGroupFormData } from "@/app/(authenticated)/(non-admin)/community/groups/create/client"
import type { Envelope } from "@/types"
import type {
  Group,
  GroupInvitation,
  Message,
  User,
} from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export type GroupWithCreated = Group & {
  createdBy: Pick<
    User,
    "_id" | "name" | "username" | "profileImage" | "activeStatus"
  >
}

export type GroupMessage = Message & {
  senderId: Pick<
    User,
    "_id" | "name" | "username" | "profileImage" | "activeStatus"
  >
  receiverId: Pick<
    User,
    "_id" | "name" | "username" | "profileImage" | "activeStatus"
  > | null
}

type GroupInvitationExtended = GroupInvitation & {
  groupId: Pick<
    Group,
    | "_id"
    | "name"
    | "avatar"
    | "isPublic"
    | "memberCount"
    | "description"
    | "createdBy"
  >
  sender: Pick<
    User,
    "_id" | "name" | "username" | "profileImage" | "activeStatus"
  >
  recipient: Pick<
    User,
    "_id" | "name" | "username" | "profileImage" | "activeStatus"
  >
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
  updates: Partial<
    Pick<Group, "name" | "description" | "category" | "tags" | "isPublic">
  >,
) {
  try {
    await http.put(`/groups/${encodeURIComponent(groupId)}`, updates)
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
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
        members: Pick<
          User,
          | "_id"
          | "name"
          | "username"
          | "profileImage"
          | "location"
          | "activeStatus"
        >[]
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
export async function inviteMember(groupId: string, userId: string) {
  try {
    await http.post(`/groups/${encodeURIComponent(groupId)}/invite`, {
      userId,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Remove a member from group
 * DELETE /api/groups/:id/remove/:userId
 */
export async function removeMember(groupId: string, userId: string) {
  try {
    await http.delete(
      `/groups/${encodeURIComponent(groupId)}/remove/${encodeURIComponent(userId)}`,
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
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

/**
 * Update group avatar image
 * PUT /api/groups/:groupId/avatar
 */
export async function updateGroupAvatar(groupId: string, image: File) {
  try {
    const formData = new FormData()
    formData.append("image", image)

    await http.put(`/groups/${encodeURIComponent(groupId)}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Get user's group invites (both sent and received)
 * GET /api/groups/invitations
 */
export async function fetchUserGroupInvitations() {
  try {
    const resp = await http.get<
      Envelope<{
        invitations: GroupInvitationExtended[]
      }>
    >(`/groups/invitations`)
    return resp.data.data.invitations
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Get group invitation request (admin only)
 * GET /api/groups/:groupId/invitations
 */
export async function fetchGroupInvitations(groupId: string) {
  try {
    const resp = await http.get<
      Envelope<{
        invitations: GroupInvitationExtended[]
      }>
    >(`/groups/${encodeURIComponent(groupId)}/invitations`)
    return resp.data.data.invitations
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Accept a group invitation
 * POST /api/groups/invitations/:invitationId/accept
 */
export async function acceptGroupInvitation(invitationId: string) {
  try {
    await http.post(
      `/groups/invitations/${encodeURIComponent(invitationId)}/accept`,
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * Reject a group invitation
 * DELETE /api/groups/invitations/:invitationId/reject
 */
export async function rejectGroupInvitation(invitationId: string) {
  try {
    await http.delete(
      `/groups/invitations/${encodeURIComponent(invitationId)}/reject`,
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

/**
 * GET /api/groups/:groupId/invite-recommendations
 * Get invite recommendations (admin only)
 */
export async function fetchGroupRecommendations(groupId: string) {
  try {
    const resp = await http.get<
      Envelope<{
        recommendations: (Pick<
          User,
          "_id" | "name" | "username" | "profileImage" | "activeStatus"
        > & { score: number })[]
      }>
    >(`/groups/${encodeURIComponent(groupId)}/invite-recommendations`)
    return resp.data.data.recommendations
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}
