import type { Envelope } from "@/types"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

// Types
export interface CollaborationGoal {
  _id: string
  title: string
  description?: string
  target: number
  progress: number
  status: "not-started" | "in-progress" | "completed"
  category?: string
  visibility: "public" | "private"
  createdBy: {
    _id: string
    username: string
    name?: string
    profileImage?: string
  }
  participants: Array<{
    _id: string
    username: string
    name?: string
    profileImage?: string
  }>
  createdAt: string
  updatedAt: string
}

export interface GoalInvitation {
  _id: string
  goal: {
    _id: string
    title: string
    description?: string
    target: number
    progress: number
    status: string
  }
  sender: {
    _id: string
    username: string
    name?: string
    profileImage?: string
  }
  recipient: {
    _id: string
    username: string
    name?: string
    profileImage?: string
  }
  status: "pending" | "accepted" | "declined"
  message?: string
  createdAt: string
}

export interface CreateCollaborationGoalInput {
  title: string
  description?: string
  target?: number
  category?: string
  visibility?: "public" | "private"
}

// API Functions

/** GET /collaboration-goals - Get all group goals for current user */
export async function fetchCollaborationGoals(): Promise<CollaborationGoal[]> {
  try {
    const resp = await http.get<Envelope<{ goals: CollaborationGoal[] }>>(
      "/collaboration-goals"
    )
    return resp.data.data.goals
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** GET /collaboration-goals/:id - Get a single group goal */
export async function fetchCollaborationGoal(id: string): Promise<CollaborationGoal> {
  try {
    const resp = await http.get<Envelope<{ goal: CollaborationGoal }>>(
      `/collaboration-goals/${id}`
    )
    return resp.data.data.goal
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /collaboration-goals - Create a new group goal */
export async function createCollaborationGoal(
  data: CreateCollaborationGoalInput
): Promise<CollaborationGoal> {
  try {
    const resp = await http.post<Envelope<{ goal: CollaborationGoal }>>(
      "/collaboration-goals",
      data
    )
    return resp.data.data.goal
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** PUT /collaboration-goals/:id - Update a group goal */
export async function updateCollaborationGoal(
  id: string,
  data: Partial<CreateCollaborationGoalInput>
): Promise<CollaborationGoal> {
  try {
    const resp = await http.put<Envelope<{ goal: CollaborationGoal }>>(
      `/collaboration-goals/${id}`,
      data
    )
    return resp.data.data.goal
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** DELETE /collaboration-goals/:id - Delete a group goal */
export async function deleteCollaborationGoal(id: string): Promise<void> {
  try {
    await http.delete(`/collaboration-goals/${id}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /collaboration-goals/:id/progress - Update progress */
export async function updateGoalProgress(
  id: string,
  increment: number
): Promise<CollaborationGoal> {
  try {
    const resp = await http.post<Envelope<{ goal: CollaborationGoal }>>(
      `/collaboration-goals/${id}/progress`,
      { increment }
    )
    return resp.data.data.goal
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /collaboration-goals/:id/leave - Leave a goal */
export async function leaveCollaborationGoal(id: string): Promise<void> {
  try {
    await http.post(`/collaboration-goals/${id}/leave`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

// Invitation APIs

/** GET /collaboration-goals/invitations - Get pending invitations */
export async function fetchPendingInvitations(): Promise<GoalInvitation[]> {
  try {
    const resp = await http.get<Envelope<{ invitations: GoalInvitation[] }>>(
      "/collaboration-goals/invitations"
    )
    return resp.data.data.invitations
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /collaboration-goals/:id/invitations - Send invitations */
export async function sendGoalInvitations(
  goalId: string,
  recipientIds: string[],
  message?: string
): Promise<GoalInvitation[]> {
  try {
    const resp = await http.post<Envelope<{ invitations: GoalInvitation[] }>>(
      `/collaboration-goals/${goalId}/invitations`,
      { recipientIds, message }
    )
    return resp.data.data.invitations
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** GET /collaboration-goals/:id/invitations - Get sent invitations for a goal */
export async function fetchSentInvitations(goalId: string): Promise<GoalInvitation[]> {
  try {
    const resp = await http.get<Envelope<{ invitations: GoalInvitation[] }>>(
      `/collaboration-goals/${goalId}/invitations`
    )
    return resp.data.data.invitations
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /collaboration-goals/invitations/:id/accept - Accept invitation */
export async function acceptGoalInvitation(invitationId: string): Promise<GoalInvitation> {
  try {
    const resp = await http.post<Envelope<{ invitation: GoalInvitation }>>(
      `/collaboration-goals/invitations/${invitationId}/accept`
    )
    return resp.data.data.invitation
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /collaboration-goals/invitations/:id/decline - Decline invitation */
export async function declineGoalInvitation(invitationId: string): Promise<GoalInvitation> {
  try {
    const resp = await http.post<Envelope<{ invitation: GoalInvitation }>>(
      `/collaboration-goals/invitations/${invitationId}/decline`
    )
    return resp.data.data.invitation
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** DELETE /collaboration-goals/invitations/:id - Cancel invitation */
export async function cancelGoalInvitation(invitationId: string): Promise<void> {
  try {
    await http.delete(`/collaboration-goals/invitations/${invitationId}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** DELETE /collaboration-goals/:id/participants/:participantId - Remove participant */
export async function removeParticipant(
  goalId: string,
  participantId: string
): Promise<CollaborationGoal> {
  try {
    const resp = await http.delete<Envelope<{ goal: CollaborationGoal }>>(
      `/collaboration-goals/${goalId}/participants/${participantId}`
    )
    return resp.data.data.goal
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
