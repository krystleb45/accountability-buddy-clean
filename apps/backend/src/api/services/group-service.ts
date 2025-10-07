import type { Category } from "@ab/shared/categories"
import type { Server } from "socket.io"

import {
  NEW_GROUP_MESSAGE,
  USER_REMOVED_FROM_GROUP,
} from "@ab/shared/socket-events"
import mongoose from "mongoose"

import type {
  Group as IGroup,
  User as IUser,
  UserDocument,
} from "../../types/mongoose.gen"
import type { UpdateGroupBody } from "../routes/groups"

import { logger } from "../../utils/winstonLogger"
import { CustomError } from "../middleware/errorHandler"
import { Group } from "../models/Group"
import { GroupInvitation } from "../models/GroupInvitation"
import Notification from "../models/Notification"
import { User } from "../models/User"
import { FileUploadService } from "./file-upload-service"
import MessageService from "./message-service"

class GroupService {
  /**
   * Get all groups with optional filters
   */
  async getGroups(category?: Category, search?: string) {
    const filter: mongoose.FilterQuery<IGroup> = {}

    if (category) {
      filter.category = category
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const groups = await Group.find(filter)
      .populate("createdBy", "name profilePicture username")
      .sort({ lastActivity: -1 })
      .limit(20)
      .lean({ virtuals: true })

    for (const group of groups) {
      if (group.avatar) {
        group.avatar = await FileUploadService.generateSignedUrl(group.avatar)
      }

      if ((group.createdBy as UserDocument).profileImage) {
        ;(group.createdBy as UserDocument).profileImage =
          await FileUploadService.generateSignedUrl(
            (group.createdBy as UserDocument).profileImage,
          )
      }
    }

    return groups
  }

  /**
   * Create a new group (simplified signature)
   */
  // Updated GroupService.createGroup method - replace the existing one

  /**
   * Create a new group with proper parameter handling
   */
  // In your GroupService.ts, update the createGroup method to ensure creator is properly added:

  async createGroup({
    name,
    description,
    category,
    privacy,
    creatorId,
    tags,
  }: {
    name: string
    description: string
    category: Category
    creatorId: string
    privacy: "public" | "private"
    tags?: string[]
  }) {
    try {
      const creatorObjectId = new mongoose.Types.ObjectId(creatorId)

      const group = await Group.create({
        name: name.trim(),
        description: description.trim(),
        category,
        visibility: privacy,
        tags: tags || [],
        createdBy: creatorObjectId,
        members: [creatorObjectId], // IMPORTANT: Creator is automatically a member
        lastActivity: new Date(),
        unreadMessages: [],
      })

      await group.populate("createdBy", "name")

      logger.info(`Group ${group._id} created by ${creatorId}`)

      return group.toObject()
    } catch (error) {
      logger.error(`Failed to create group: ${error}`)
      throw error
    }
  }

  async updateAvatarImage(groupId: string, key: string) {
    await Group.findByIdAndUpdate(groupId, { avatar: key }).exec()
  }

  /**
   * Get specific group details
   */
  async getGroupDetails(groupId: string, userId: string) {
    const group = await Group.findById(groupId)
      .populate("createdBy", "name profileImage username")
      .lean({ virtuals: true })

    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    const isJoined =
      group.members?.some((member) => member._id.equals(userId)) || false

    if (!group.isPublic && !isJoined) {
      throw new CustomError("Access denied. Not a group member.", 403)
    }

    const { members: _, ...groupData } = group

    if (groupData.avatar) {
      groupData.avatar = await FileUploadService.generateSignedUrl(
        groupData.avatar,
      )
    }

    if ((groupData.createdBy as UserDocument).profileImage) {
      ;(groupData.createdBy as UserDocument).profileImage =
        await FileUploadService.generateSignedUrl(
          (groupData.createdBy as UserDocument).profileImage,
        )
    }

    return groupData
  }

  /**
   * Add a member to a group
   */
  async joinGroup(groupId: string, userId: string, io: Server): Promise<void> {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if group is private and requires invitation
    if (!group.isPublic) {
      const invitation = await GroupInvitation.findOne({
        groupId: group._id,
        recipient: userId,
        status: "pending",
      })

      if (!invitation) {
        throw new CustomError("This group requires an invitation", 403)
      }
    }

    if (group.members.some((m) => m._id.equals(userId))) {
      throw new CustomError("Already a member of this group", 400)
    }

    group.members.push(userId)
    await group.save()

    // Notify everyone in the group room
    io.in(groupId).emit("userJoined", { userId })
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string, io: Server) {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if user is a member
    if (!group.members.some((m) => m._id.equals(userId))) {
      throw new CustomError("Not a member of this group", 400)
    }

    // Prevent creator from leaving if they're the only admin
    if (group.createdBy.equals(userId)) {
      throw new CustomError(
        "Group creator cannot leave the group. Delete the group instead",
        400,
      )
    }

    group.members.pull(userId)
    await group.save()

    // Broadcast to the group room
    io.in(groupId).emit("userLeft", { userId })
  }

  /**
   * Update group details (admin only)
   */
  async updateGroup(
    groupId: string,
    userId: string,
    updates: Pick<IGroup, keyof UpdateGroupBody>,
  ) {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if user is admin (creator or has admin role)
    if (!group.createdBy._id.equals(userId)) {
      throw new CustomError("Only group admin can update group details", 403)
    }

    group.name = updates.name
    group.description = updates.description
    group.category = updates.category
    group.visibility = updates.isPublic ? "public" : "private"
    group.tags.splice(0, group.tags.length, ...(updates.tags || []))

    group.lastActivity = new Date()
    await group.save()
  }

  /**
   * Delete a group (only creator or system admin)
   */
  async deleteGroup(
    groupId: string,
    requesterId: string,
    isAdmin = false,
  ): Promise<void> {
    const group = await Group.findById(groupId)
    if (!group) throw new Error("Group not found")

    if (!isAdmin && group.createdBy.toString() !== requesterId) {
      throw new Error("Not authorized")
    }

    // Delete associated messages
    await GroupMessage.deleteMany({
      groupId: new mongoose.Types.ObjectId(groupId),
    })

    await group.deleteOne()
    logger.info(`Group ${groupId} deleted by ${requesterId}`)
  }

  /**
   * List groups the user has joined
   */
  async getUserGroups(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId)

    const groups = await Group.find({ members: userObjectId, isActive: true })
      .populate("createdBy", "name profilePicture username")
      .sort({ lastActivity: -1 })
      .lean({ virtuals: true })

    for (const group of groups) {
      if (group.avatar) {
        group.avatar = await FileUploadService.generateSignedUrl(group.avatar)
      }

      if ((group.createdBy as UserDocument).profileImage) {
        ;(group.createdBy as UserDocument).profileImage =
          await FileUploadService.generateSignedUrl(
            (group.createdBy as UserDocument).profileImage,
          )
      }
    }

    return groups
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string, userId: string) {
    const group = await Group.findById(groupId).populate(
      "members",
      "name username profileImage",
    )

    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if user is a member
    const userObjectId = new mongoose.Types.ObjectId(userId)
    if (!group.members.some((member) => member._id.equals(userObjectId))) {
      throw new CustomError("Not a member of this group", 403)
    }

    const membersData: IUser[] = []

    for (const member of group.members as UserDocument[]) {
      let profileImage = member.profileImage
      if (profileImage) {
        profileImage = await FileUploadService.generateSignedUrl(profileImage)
      }

      const memberData = member.toObject()

      membersData.push({
        ...memberData,
        profileImage,
      })
    }

    return membersData
  }

  /**
   * Get group messages
   */
  async getGroupMessages(
    groupId: string,
    userId: string,
    options: {
      limit?: number
      page?: number
      before?: string
    } = {},
  ) {
    // Check if user is a member
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)
    if (!group.members.some((member) => member._id.equals(userObjectId))) {
      throw new CustomError("Not authorized to view messages", 403)
    }

    return await MessageService.getMessagesInThread(groupId, options)
  }

  /**
   * Send group message
   */
  async sendGroupMessage(
    groupId: string,
    userId: string,
    content: string,
    io: Server,
  ) {
    const message = await MessageService.sendMessage(
      userId,
      undefined,
      content,
      "group",
      groupId,
    )

    // Update group's last activity
    await Group.findByIdAndUpdate(groupId, { lastActivity: new Date() }).exec()

    // Emit to group room
    io.in(groupId).emit(NEW_GROUP_MESSAGE, {
      ...message.toObject(),
      type: "message",
    })
  }

  /**
   * Request invitation to private group
   */
  async requestGroupInvite(groupId: string, userId: string) {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if user is already a member
    if (group.members.some((member) => member._id.equals(userId))) {
      throw new CustomError("Already a member of this group", 400)
    }

    const user = await User.findById(userId)

    // Create invitation
    await GroupInvitation.create({
      groupId: group._id,
      sender: userId,
      recipient: group.createdBy, // Send to group creator/admin
      status: "pending",
    })

    // Notify group admin
    await Notification.create({
      user: group.createdBy,
      message: `User ${user.username} has requested to join your group "${group.name}"`,
      type: "group_invite",
      read: false,
      link: `/groups/${groupId}`,
    })
  }

  /**
   * Invite a member to group
   */
  async inviteMember(
    groupId: string,
    inviteeId: string,
    inviterId: string,
    io: Server,
  ): Promise<void> {
    const group = await Group.findById(groupId)
    if (!group) throw new Error("Group not found")

    // Check if inviter is a member
    const inviterObjectId = new mongoose.Types.ObjectId(inviterId)
    if (!group.members.some((member) => member.equals(inviterObjectId))) {
      throw new Error("Not authorized to invite members")
    }

    // Check if invitee is already a member
    const inviteeObjectId = new mongoose.Types.ObjectId(inviteeId)
    if (group.members.some((member) => member.equals(inviteeObjectId))) {
      throw new Error("User is already a member")
    }

    const notification = await Notification.create({
      user: inviteeId,
      message: `You've been invited to join group "${group.name}"`,
      type: "invitation",
      read: false,
      link: `/groups/${groupId}`,
    })

    // Emit to the user room
    io.to(inviteeId).emit("groupInvitation", {
      groupId,
      message: notification.message,
    })

    logger.info(
      `Invitation for group ${groupId} sent to ${inviteeId} by ${inviterId}`,
    )
  }

  /**
   * Remove a member from group (admin only)
   */
  async removeMember(
    groupId: string,
    memberToRemove: string,
    adminId: string,
    io: Server,
  ) {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if requester is admin
    if (!group.createdBy._id.equals(adminId)) {
      throw new CustomError("Only group admin can remove members", 403)
    }

    // Check if member exists
    if (!group.members.some((member) => member._id.equals(memberToRemove))) {
      throw new CustomError("User is not a member of this group", 404)
    }

    // Cannot remove the group creator
    if (group.createdBy._id.equals(memberToRemove)) {
      throw new CustomError("Cannot remove the group creator", 400)
    }

    group.members.pull(memberToRemove)
    group.lastActivity = new Date()
    await group.save()

    // Notify the group
    io.in(groupId).emit(USER_REMOVED_FROM_GROUP, { userId: memberToRemove })
  }

  /**
   * Legacy: Invite to group (keeping for backward compatibility)
   */
  async inviteToGroup(
    groupId: string,
    userId: string,
    io: Server,
  ): Promise<void> {
    const group = await Group.findById(groupId)
    if (!group) throw new Error("Group not found")

    const notification = await Notification.create({
      user: userId,
      message: `You've been invited to join group "${group.name}"`,
      type: "invitation",
      read: false,
      link: `/groups/${groupId}`,
    })

    // Emit to the user room
    io.to(userId).emit("groupInvitation", {
      groupId,
      message: notification.message,
    })

    logger.info(`Invitation for group ${groupId} sent to ${userId}`)
  }

  /**
   * Get user's group invitations (both sent and received)
   */
  async getUserGroupInvitations(userId: string) {
    const invitations = await GroupInvitation.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: { $in: ["pending", "rejected"] },
    })
      .populate(
        "groupId",
        "name avatar memberCount description isPublic createdBy",
      )
      .populate("sender", "name username profileImage")
      .populate("recipient", "name username profileImage")
      .sort({ createdAt: -1 })
      .lean()

    for (const invite of invitations) {
      if ((invite.sender as UserDocument).profileImage) {
        ;(invite.sender as UserDocument).profileImage =
          await FileUploadService.generateSignedUrl(
            (invite.sender as UserDocument).profileImage,
          )
      }

      if ((invite.recipient as UserDocument).profileImage) {
        ;(invite.recipient as UserDocument).profileImage =
          await FileUploadService.generateSignedUrl(
            (invite.recipient as UserDocument).profileImage,
          )
      }
    }

    return invitations
  }

  /**
   * Get group invitations (admin only)
   */
  async getGroupInvitations(groupId: string, adminId: string) {
    const group = await Group.findById(groupId).select("createdBy")
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if requester is admin
    if (!group.createdBy._id.equals(adminId)) {
      throw new CustomError("Only group admin can view invitations", 403)
    }

    const invitations = await GroupInvitation.find({
      groupId: group._id,
      status: "pending",
    })
      .populate(
        "groupId",
        "name avatar memberCount description isPublic createdBy",
      )
      .populate("sender", "name username profileImage")
      .populate("recipient", "name username profileImage")
      .sort({ createdAt: -1 })
      .lean()

    for (const invite of invitations) {
      if ((invite.sender as UserDocument).profileImage) {
        ;(invite.sender as UserDocument).profileImage =
          await FileUploadService.generateSignedUrl(
            (invite.sender as UserDocument).profileImage,
          )
      }

      if ((invite.recipient as UserDocument).profileImage) {
        ;(invite.recipient as UserDocument).profileImage =
          await FileUploadService.generateSignedUrl(
            (invite.recipient as UserDocument).profileImage,
          )
      }
    }

    return invitations
  }

  /**
   * Accept a group invitation
   */
  async acceptGroupInvitation(invitationId: string, userId: string) {
    const invitation = await GroupInvitation.findById(invitationId)
      .populate("recipient", "username")
      .populate("sender", "username")
    if (!invitation) {
      throw new CustomError("Invitation not found", 404)
    }

    const group = await Group.findById(invitation.groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Only recipient can accept
    if (!invitation.recipient._id.equals(userId)) {
      throw new CustomError("Not authorized to accept this invitation", 403)
    }

    if (invitation.status !== "pending") {
      throw new CustomError("Invitation is not pending", 400)
    }

    const isRequestedToJoin = group.createdBy._id.equals(
      invitation.recipient._id,
    )
    const newUser = isRequestedToJoin ? invitation.sender : invitation.recipient

    // Add user to group members if not already a member
    if (!group.members.some((member) => member._id.equals(newUser._id))) {
      group.members.push(newUser._id)
      group.lastActivity = new Date()
      await group.save()
    }

    invitation.status = "accepted"
    await invitation.save()

    // Notify the sender about acceptance
    await Notification.create({
      user: invitation.sender,
      message: isRequestedToJoin
        ? `Your invitation to join group "${group.name}" was accepted`
        : `${invitation.recipient.username} accepted your request to join group "${group.name}"`,
      type: isRequestedToJoin
        ? "group_request_accepted"
        : "group_invite_accepted",
      read: false,
      link: `/community/groups/${group._id}`,
    })
  }

  /**
   * Reject a group invitation
   */
  async rejectGroupInvitation(invitationId: string, userId: string) {
    const invitation = await GroupInvitation.findById(invitationId)
    if (!invitation) {
      throw new CustomError("Invitation not found", 404)
    }

    const group = await Group.findById(invitation.groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Only group admin can reject
    if (!group.createdBy._id.equals(userId)) {
      throw new CustomError("Only group admin can reject invitations", 403)
    }

    if (invitation.status !== "pending") {
      throw new CustomError("Invitation is not pending", 400)
    }

    invitation.status = "rejected"
    await invitation.save()

    // Notify the sender about rejection
    await Notification.create({
      user: invitation.sender,
      message: `Your invitation to join group "${group.name}" was rejected`,
      type: "group_request_rejected",
      read: false,
      link: `/community/groups`,
    })
  }
}

export default new GroupService()
