import type { Category } from "@ab/shared/categories"
import type { Server } from "socket.io"

import { NEW_GROUP_MESSAGE } from "@ab/shared/socket-events"
import mongoose from "mongoose"

import type { Group as IGroup, UserDocument } from "../../types/mongoose.gen"

import { logger } from "../../utils/winstonLogger"
import { CustomError } from "../middleware/errorHandler"
import { Group } from "../models/Group"
import { GroupInvitation } from "../models/GroupInvitation"
import { Message } from "../models/Message"
import Notification from "../models/Notification"
import { User } from "../models/User"
import { FileUploadService } from "./file-upload-service"
import MessageService from "./message-service"

interface FormattedGroup {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  isPublic: boolean
  isJoined: boolean
  lastActivity: string
  avatar: string | null
  tags: string[]
  createdBy: string
  createdAt: string
}

class GroupService {
  /**
   * Get all groups with optional filters
   */
  async getGroups(category?: Category, search?: string) {
    const filter: mongoose.FilterQuery<IGroup> = {
      visibility: "public", // Only show public groups in general listing
    }

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
    updates: Partial<IGroup>,
  ): Promise<FormattedGroup> {
    const group = await Group.findById(groupId)
    if (!group) throw new Error("Group not found")

    // Check if user is admin (creator or has admin role)
    const userObjectId = new mongoose.Types.ObjectId(userId)
    if (!group.createdBy.equals(userObjectId)) {
      throw new Error("Only group admin can update group details")
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "description",
      "category",
      "tags",
      "isPublic",
      "avatar",
    ]
    Object.keys(updates).forEach((key) => {
      if (
        allowedUpdates.includes(key) &&
        updates[key as keyof IGroup] !== undefined
      ) {
        ;(group as any)[key] = updates[key as keyof IGroup]
      }
    })

    group.lastActivity = new Date()
    await group.save()
    await group.populate("createdBy", "name")

    logger.info(`Group ${groupId} updated by ${userId}`)

    return {
      id: group._id.toString(),
      name: group.name,
      description: group.description || "",
      category: group.category || "general",
      memberCount: group.members?.length || 0,
      isPublic: group.isPublic ?? true,
      isJoined: true, // User must be admin to update, so they're definitely joined
      lastActivity: group.lastActivity.toISOString(),
      avatar: group.avatar || null,
      tags: group.tags || [],
      createdBy: (group.createdBy as any).name,
      createdAt: group.createdAt.toISOString(),
    }
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
      throw new CustomError("Not authorized to view members", 403)
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
      type: "invitation",
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
  ): Promise<void> {
    const group = await Group.findById(groupId)
    if (!group) throw new Error("Group not found")

    // Check if requester is admin
    const adminObjectId = new mongoose.Types.ObjectId(adminId)
    if (!group.createdBy.equals(adminObjectId)) {
      throw new Error("Only group admin can remove members")
    }

    // Check if member exists
    const memberObjectId = new mongoose.Types.ObjectId(memberToRemove)
    if (!group.members.some((member) => member.equals(memberObjectId))) {
      throw new Error("User is not a member of this group")
    }

    // Cannot remove the group creator
    if (group.createdBy.equals(memberObjectId)) {
      throw new Error("Cannot remove group creator")
    }

    group.members = group.members.filter(
      (member) => !member.equals(memberObjectId),
    )
    group.lastActivity = new Date()
    await group.save()

    // Notify the group
    io.in(groupId).emit("memberRemoved", { userId: memberToRemove })

    logger.info(
      `Member ${memberToRemove} removed from group ${groupId} by ${adminId}`,
    )
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
}

export default new GroupService()
