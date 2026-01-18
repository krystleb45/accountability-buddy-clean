import { Types } from "mongoose"

import { createError } from "../middleware/errorHandler.js"
import { CollaborationGoal } from "../models/CollaborationGoal.js"
import { GoalInvitation } from "../models/GoalInvitation.js"
import { User } from "../models/User.js"

class CollaborationGoalService {
  /**
   * Create a new collaboration goal (creator is automatically a participant).
   */
  static async create(
    creatorId: string,
    data: {
      title: string
      description?: string
      target?: number
      category?: string
      visibility?: "public" | "private"
    }
  ) {
    const goal = new CollaborationGoal({
      title: data.title,
      description: data.description || "",
      target: data.target || 100,
      category: data.category || "other",
      visibility: data.visibility || "private",
      createdBy: new Types.ObjectId(creatorId),
      participants: [new Types.ObjectId(creatorId)],
      progress: 0,
      status: "not-started",
    })

    await goal.save()
    return goal.populate(["createdBy", "participants"])
  }

  /**
   * Get a single collaboration goal by ID
   */
  static async getById(goalId: string, userId: string) {
    const goal = await CollaborationGoal.findById(goalId)
      .populate("createdBy", "username name profileImage")
      .populate("participants", "username name profileImage")
      .exec()

    if (!goal) {
      throw createError("Goal not found", 404)
    }

    // Check if user is a participant or goal is public
    const isParticipant = goal.participants.some(
      (p: any) => p._id.toString() === userId
    )
    if (!isParticipant && goal.visibility !== "public") {
      throw createError("Not authorized to view this goal", 403)
    }

    return goal
  }

  /**
   * Fetch all collaboration goals where the user is a participant.
   */
  static async getForUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw createError("Invalid user ID", 400)
    }

    return CollaborationGoal.find({
      participants: new Types.ObjectId(userId),
    })
      .populate("createdBy", "username name profileImage")
      .populate("participants", "username name profileImage")
      .sort({ createdAt: -1 })
      .exec()
  }

  /**
   * Count collaboration goals for a user
   */
  static async countForUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw createError("Invalid user ID", 400)
    }
    return CollaborationGoal.countDocuments({
      participants: new Types.ObjectId(userId),
    })
  }

  /**
   * Update a collaboration goal (only creator can update)
   */
  static async update(
    goalId: string,
    userId: string,
    updates: {
      title?: string
      description?: string
      target?: number
      category?: string
      visibility?: "public" | "private"
    }
  ) {
    const goal = await CollaborationGoal.findById(goalId).exec()
    
    if (!goal) {
      throw createError("Goal not found", 404)
    }
    
    if (goal.createdBy.toString() !== userId) {
      throw createError("Only the creator can update this goal", 403)
    }

    Object.assign(goal, updates)
    await goal.save()
    
    return goal.populate(["createdBy", "participants"])
  }

  /**
   * Update progress on a collaboration goal (any participant can update)
   */
  static async updateProgress(
    goalId: string,
    userId: string,
    progressIncrement: number
  ) {
    const goal = await CollaborationGoal.findById(goalId).exec()
    
    if (!goal) {
      throw createError("Goal not found", 404)
    }

    const isParticipant = goal.participants.some(
      (p) => p.toString() === userId
    )
    if (!isParticipant) {
      throw createError("Only participants can update progress", 403)
    }

    goal.progress = Math.min(goal.progress + progressIncrement, goal.target)
    goal.status = goal.progress >= goal.target ? "completed" : "in-progress"
    
    await goal.save()
    return goal.populate(["createdBy", "participants"])
  }

  /**
   * Delete a collaboration goal (only creator can delete)
   */
  static async delete(goalId: string, userId: string): Promise<void> {
    const goal = await CollaborationGoal.findById(goalId).exec()
    
    if (!goal) {
      throw createError("Goal not found", 404)
    }
    
    if (goal.createdBy.toString() !== userId) {
      throw createError("Only the creator can delete this goal", 403)
    }

    // Delete all related invitations
    await GoalInvitation.deleteMany({ groupId: goalId })
    
    await CollaborationGoal.deleteOne({ _id: goalId }).exec()
  }

  /**
   * Leave a collaboration goal (participants can leave, creator cannot)
   */
  static async leaveGoal(goalId: string, userId: string) {
    const goal = await CollaborationGoal.findById(goalId).exec()
    
    if (!goal) {
      throw createError("Goal not found", 404)
    }

    if (goal.createdBy.toString() === userId) {
      throw createError("Creator cannot leave the goal. Delete it instead.", 400)
    }

    const isParticipant = goal.participants.some(
      (p) => p.toString() === userId
    )
    if (!isParticipant) {
      throw createError("You are not a participant of this goal", 400)
    }

    goal.participants = goal.participants.filter(
      (p) => p.toString() !== userId
    ) as any
    
    await goal.save()
  }

  // ==================== INVITATION METHODS ====================

  /**
   * Send invitations to friends for a collaboration goal
   */
  static async sendInvitations(
    goalId: string,
    senderId: string,
    recipientIds: string[],
    message?: string
  ) {
    const goal = await CollaborationGoal.findById(goalId).exec()
    
    if (!goal) {
      throw createError("Goal not found", 404)
    }

    if (goal.createdBy.toString() !== senderId) {
      throw createError("Only the creator can send invitations", 403)
    }

    // Verify recipients are friends of the sender
    const sender = await User.findById(senderId).select("friends").exec()
    if (!sender) {
      throw createError("Sender not found", 404)
    }

    const friendIds = sender.friends.map((f) => f.toString())
    const validRecipients = recipientIds.filter((id) => friendIds.includes(id))

    if (validRecipients.length === 0) {
      throw createError("No valid friends to invite", 400)
    }

    // Filter out users already participating or with pending invitations
    const existingParticipants = goal.participants.map((p) => p.toString())
    const existingInvitations = await GoalInvitation.find({
      groupId: goalId,
      status: "pending",
    }).select("recipient")
    const pendingRecipients = existingInvitations.map((i) => i.recipient.toString())

    const newRecipients = validRecipients.filter(
      (id) => !existingParticipants.includes(id) && !pendingRecipients.includes(id)
    )

    if (newRecipients.length === 0) {
      throw createError("All selected friends are already participants or have pending invitations", 400)
    }

    // Create invitations
    const invitations = await GoalInvitation.insertMany(
      newRecipients.map((recipientId) => ({
        groupId: goalId,
        sender: senderId,
        recipient: recipientId,
        message: message || `You've been invited to join a group goal: "${goal.title}"`,
        status: "pending",
      }))
    )

    return invitations
  }

  /**
   * Get pending invitations for a user
   */
  static async getPendingInvitations(userId: string) {
    try {
      console.log("getPendingInvitations called for user:", userId)
      const invitations = await GoalInvitation.find({
        recipient: new Types.ObjectId(userId),
        status: "pending",
      })
        .populate("groupId", "title description target progress status")
        .populate("sender", "username name profileImage")
        .sort({ createdAt: -1 })
        .exec()
      console.log("Found invitations:", invitations.length)
      return invitations
    } catch (error) {
      console.error("getPendingInvitations ERROR:", error)
      throw error
    }
  }
  /**
   * Get sent invitations for a goal (for the creator to see)
   */
  static async getSentInvitations(goalId: string, userId: string) {
    const goal = await CollaborationGoal.findById(goalId).exec()
    
    if (!goal) {
      throw createError("Goal not found", 404)
    }

    if (goal.createdBy.toString() !== userId) {
      throw createError("Only the creator can view sent invitations", 403)
    }

    return GoalInvitation.find({ groupId: goalId })
      .populate("recipient", "username name profileImage")
      .sort({ createdAt: -1 })
      .exec()
  }

  /**
   * Accept a goal invitation
   */
  static async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await GoalInvitation.findById(invitationId).exec()
    
    if (!invitation) {
      throw createError("Invitation not found", 404)
    }

    if (invitation.recipient.toString() !== userId) {
      throw createError("This invitation is not for you", 403)
    }

    if (invitation.status !== "pending") {
      throw createError("This invitation has already been responded to", 400)
    }

    // Update invitation status
    invitation.status = "accepted"
    await invitation.save()

    // Add user to goal participants
    const goal = await CollaborationGoal.findById(invitation.groupId).exec()
    if (goal) {
      if (!goal.participants.some((p) => p.toString() === userId)) {
        goal.participants.push(new Types.ObjectId(userId))
        await goal.save()
      }
    }

    return invitation.populate(["groupId", "sender"])
  }

  /**
   * Decline a goal invitation
   */
  static async declineInvitation(invitationId: string, userId: string) {
    const invitation = await GoalInvitation.findById(invitationId).exec()
    
    if (!invitation) {
      throw createError("Invitation not found", 404)
    }

    if (invitation.recipient.toString() !== userId) {
      throw createError("This invitation is not for you", 403)
    }

    if (invitation.status !== "pending") {
      throw createError("This invitation has already been responded to", 400)
    }

    invitation.status = "declined"
    await invitation.save()

    return invitation
  }

  /**
   * Cancel a sent invitation (sender or goal creator can cancel)
   */
  static async cancelInvitation(invitationId: string, userId: string) {
    const invitation = await GoalInvitation.findById(invitationId)
      .populate("groupId")
      .exec()
    
    if (!invitation) {
      throw createError("Invitation not found", 404)
    }

    const goal = invitation.groupId as any
    const isSender = invitation.sender.toString() === userId
    const isCreator = goal.createdBy.toString() === userId

    if (!isSender && !isCreator) {
      throw createError("Not authorized to cancel this invitation", 403)
    }

    if (invitation.status !== "pending") {
      throw createError("Can only cancel pending invitations", 400)
    }

    await GoalInvitation.deleteOne({ _id: invitationId })
  }

  /**
   * Remove a participant from a goal (only creator can remove)
   */
  static async removeParticipant(
    goalId: string,
    creatorId: string,
    participantId: string
  ) {
    const goal = await CollaborationGoal.findById(goalId).exec()
    
    if (!goal) {
      throw createError("Goal not found", 404)
    }

    if (goal.createdBy.toString() !== creatorId) {
      throw createError("Only the creator can remove participants", 403)
    }

    if (participantId === creatorId) {
      throw createError("Cannot remove yourself as creator", 400)
    }

    goal.participants = goal.participants.filter(
      (p) => p.toString() !== participantId
    ) as any
    
    await goal.save()
    return goal.populate(["createdBy", "participants"])
  }
}

export default CollaborationGoalService