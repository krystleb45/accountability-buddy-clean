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
import { ChatService } from "./chat-service"
import { FileUploadService } from "./file-upload-service"

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
    if (group.createdBy._id.equals(userId)) {
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
  async deleteGroup(groupId: string, requesterId: string) {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    if (group.createdBy.toString() !== requesterId) {
      throw new CustomError("Not authorized", 403)
    }

    const chatId = (await ChatService.getGroupChat(groupId))._id.toString()

    // Delete group chat
    await ChatService.deleteChat(chatId)
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

    const groupChatId = (await ChatService.getGroupChat(groupId))._id.toString()
    return ChatService.fetchMessages(groupChatId, options)
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
    const chat = await ChatService.getGroupChat(groupId)

    const message = await ChatService.sendMessage({
      chatId: chat._id.toString(),
      senderId: userId,
      content,
    })

    // Update group's last activity
    await Group.findByIdAndUpdate(groupId, { lastActivity: new Date() }).exec()

    // Emit to group room
    io.in(groupId).emit(NEW_GROUP_MESSAGE, {
      ...message.toObject(),
      text: content, // message has encrypted text, we send plain text here
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
  async inviteMember(groupId: string, inviteeId: string, inviterId: string) {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if inviter is a admin
    if (!group.createdBy._id.equals(inviterId)) {
      throw new CustomError("Not authorized to invite members", 403)
    }

    // Check if invitee is already a member
    if (group.members.some((member) => member._id.equals(inviteeId))) {
      throw new CustomError("User is already a member", 400)
    }

    await GroupInvitation.create({
      groupId: group._id,
      sender: inviterId,
      recipient: inviteeId,
      status: "pending",
    })

    await Notification.create({
      user: inviteeId,
      message: `You've been invited to join group "${group.name}"`,
      type: "group_invite",
      read: false,
      link: `/community/groups`,
    })
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

      if ((invite.groupId as IGroup).avatar) {
        ;(invite.groupId as IGroup).avatar =
          await FileUploadService.generateSignedUrl(
            (invite.groupId as IGroup).avatar,
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

    // Only recipient can reject
    if (!invitation.recipient._id.equals(userId)) {
      throw new CustomError("Not authorized to reject this invitation", 403)
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

  /**
   * Get invite recommendations (admin only) - Advanced pipeline
   */
  async getInviteRecommendations(groupId: string, adminId: string) {
    const group = await Group.findById(groupId).populate(
      "members",
      "friends interests location",
    )

    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    // Check if requester is admin
    if (!group.createdBy._id.equals(adminId)) {
      throw new CustomError("Only group admin can view recommendations", 403)
    }

    // Get existing group invitations to exclude users who already have pending invites
    const existingInvitations = await GroupInvitation.find({
      groupId: group._id,
      status: "pending",
    }).select("recipient sender")

    // Build exclusion list
    const excludedUserIds = new Set([
      ...group.members.map((member) => member._id.toString()),
      ...existingInvitations.map((inv) => inv.recipient.toString()),
      ...existingInvitations.map((inv) => inv.sender.toString()),
    ])

    try {
      // Step 1: Friend-based recommendations (highest priority)
      const friendRecommendations = await this._getFriendBasedRecommendations(
        group.members.map((m) => m._id.toString()),
        excludedUserIds,
      )

      // Step 2: Interest-based recommendations
      const interestRecommendations =
        await this._getInterestBasedRecommendations(
          group.members.flatMap((m) => m.interests || []),
          excludedUserIds,
        )
      // Step 3: Location-based recommendations
      const locationRecommendations =
        await this._getLocationBasedRecommendations(
          group.members.map((m) => m.location),
          excludedUserIds,
        )

      // Step 4: Activity-based recommendations
      const activityRecommendations =
        await this._getActivityBasedRecommendations(
          {
            id: group._id.toString(),
            category: group.category,
            tags: group.tags,
          },
          excludedUserIds,
        )

      // Combine and score all recommendations
      const combinedRecommendations = this._combineAndScoreRecommendations({
        friendBased: friendRecommendations,
        interestBased: interestRecommendations,
        locationBased: locationRecommendations,
        activityBased: activityRecommendations,
      })

      // Sort by score and limit to top 20
      const topRecommendations = combinedRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)

      if (topRecommendations.length === 0) {
        throw new Error("No recommendations found")
      }

      // Generate signed URLs for profile images
      for (const user of topRecommendations) {
        if (user.profileImage) {
          user.profileImage = await FileUploadService.generateSignedUrl(
            user.profileImage,
          )
        }
      }

      return topRecommendations
    } catch (error) {
      logger.error(`Error getting invite recommendations: ${error}`)

      // Fallback to simple recommendations - just exclude current group members
      const fallbackRecommendations = await User.find({
        _id: { $nin: [...excludedUserIds] },
      })
        .select("name username profileImage")
        .limit(20)
        .lean()

      for (const user of fallbackRecommendations) {
        if (user.profileImage) {
          user.profileImage = await FileUploadService.generateSignedUrl(
            user.profileImage,
          )
        }
      }

      return fallbackRecommendations.map((user) => ({
        ...user,
        score: 1,
        reasons: ["Active user"],
      }))
    }
  }

  /**
   * Get friend-based recommendations (friends of current members)
   */
  private async _getFriendBasedRecommendations(
    groupMemberIds: string[],
    excludedUserIds: Set<string>,
  ) {
    // Find friends of current group members
    const friendConnections = await User.aggregate([
      { $match: { _id: { $in: groupMemberIds } } },
      { $unwind: "$friends" },
      {
        $match: {
          friends: {
            $nin: Array.from(excludedUserIds),
          },
        },
      },
      {
        $group: {
          _id: "$friends",
          connectionCount: { $sum: 1 },
          connectedMembers: { $push: "$username" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          username: "$user.username",
          profileImage: "$user.profileImage",
          connectionCount: 1,
          connectedMembers: 1,
        },
      },
    ])

    return friendConnections.map((user) => ({
      ...user,
      score: Math.min(user.connectionCount * 3, 10), // Max 10 points
      reasons: [
        `Connected to ${user.connectionCount} group member${user.connectionCount > 1 ? "s" : ""}`,
      ],
    }))
  }

  /**
   * Get interest-based recommendations
   */
  private async _getInterestBasedRecommendations(
    memberInterests: string[],
    excludedUserIds: Set<string>,
  ) {
    if (memberInterests.length === 0) {
      return []
    }

    const users = await User.find({
      _id: {
        $nin: Array.from(excludedUserIds),
      },
      interests: { $in: memberInterests },
    })
      .select("name username profileImage interests")
      .lean()

    return users.map((user) => {
      const commonInterests = (user.interests || []).filter((interest) =>
        memberInterests.includes(interest),
      )

      return {
        ...user,
        score: Math.min(commonInterests.length * 2, 8), // Max 8 points
        reasons: [
          `Shares ${commonInterests.length} interest${commonInterests.length > 1 ? "s" : ""}: ${commonInterests.slice(0, 3).join(", ")}`,
        ],
      }
    })
  }

  /**
   * Get location-based recommendations
   */
  private async _getLocationBasedRecommendations(
    memberLocations: IUser["location"][],
    excludedUserIds: Set<string>,
  ) {
    // Filter out null, undefined locations and extract meaningful location data
    const validLocations = memberLocations.filter(
      (location): location is NonNullable<IUser["location"]> =>
        location != null &&
        !!(location.country || location.state || location.city),
    )

    if (validLocations.length === 0) {
      return []
    }

    // Build location matching query - prioritize exact matches but also consider partial matches
    const locationQueries = validLocations
      .map((loc) => {
        const conditions: any[] = []

        // Exact city match (highest priority)
        if (loc.city) {
          conditions.push({ "location.city": loc.city })
        }

        // Same state (if no city or as fallback)
        if (loc.state) {
          conditions.push({ "location.state": loc.state })
        }

        // Same country (lowest priority)
        if (loc.country) {
          conditions.push({ "location.country": loc.country })
        }

        return conditions
      })
      .flat()

    if (locationQueries.length === 0) {
      return []
    }

    const users = await User.find({
      _id: {
        $nin: Array.from(excludedUserIds).map(
          (id) => new mongoose.Types.ObjectId(id),
        ),
      },
      $or: locationQueries,
      location: { $exists: true, $ne: null },
    })
      .select("name username profileImage location")
      .lean()

    return users.map((user) => {
      // Calculate match quality and score
      let score = 0
      let matchType = ""
      const matchDetails: string[] = []

      for (const memberLoc of validLocations) {
        // City match (highest priority - 4 points)
        if (memberLoc.city && user.location?.city === memberLoc.city) {
          score = Math.max(score, 4)
          matchType = "city"
          matchDetails.push(user.location.city)
          break
        }
        // State match (medium priority - 3 points)
        else if (memberLoc.state && user.location?.state === memberLoc.state) {
          score = Math.max(score, 3)
          matchType = matchType || "state"
          if (!matchDetails.includes(user.location.state)) {
            matchDetails.push(user.location.state)
          }
        }
        // Country match (lowest priority - 2 points)
        else if (
          memberLoc.country &&
          user.location?.country === memberLoc.country
        ) {
          score = Math.max(score, 2)
          matchType = matchType || "country"
          if (!matchDetails.includes(user.location.country)) {
            matchDetails.push(user.location.country)
          }
        }
      }

      // Build reason text based on match type
      const locationStr = [
        user.location?.city,
        user.location?.state,
        user.location?.country,
      ]
        .filter(Boolean)
        .join(", ")

      const reasonText =
        matchType === "city"
          ? `Same city: ${locationStr}`
          : matchType === "state"
            ? `Same state: ${locationStr}`
            : `Same country: ${locationStr}`

      return {
        ...user,
        score,
        reasons: [reasonText],
      }
    })
  }

  /**
   * Get activity-based recommendations (users active in similar groups)
   */
  private async _getActivityBasedRecommendations(
    {
      id,
      category,
      tags,
    }: {
      id: string
      category: IGroup["category"]
      tags: IGroup["tags"]
    },
    excludedUserIds: Set<string>,
  ) {
    // Find users in groups with similar category or tags
    const similarGroups = await Group.find({
      _id: { $ne: id },
      $or: [{ category }, { tags: { $in: tags || [] } }],
    })
      .select("members")
      .lean()

    const activeUserIds = [
      ...new Set(
        similarGroups.flatMap((g) => g.members.map((m) => m._id.toString())),
      ),
    ].filter((id) => !excludedUserIds.has(id))

    if (activeUserIds.length === 0) {
      return []
    }

    const users = await User.find({
      _id: { $in: activeUserIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .select("name username profileImage")
      .lean()

    return users.map((user) => ({
      ...user,
      score: 2, // Fixed 2 points for activity in similar groups
      reasons: [`Active in similar ${category} groups`],
    }))
  }

  /**
   * Combine and score all recommendations
   */
  private _combineAndScoreRecommendations(recommendations: {
    friendBased: (IUser & { score: number; reasons: string[] })[]
    interestBased: (IUser & { score: number; reasons: string[] })[]
    locationBased: (IUser & { score: number; reasons: string[] })[]
    activityBased: (IUser & { score: number; reasons: string[] })[]
  }) {
    const userMap = new Map()

    // Combine all recommendation sources
    const allRecommendations = [
      ...recommendations.friendBased,
      ...recommendations.interestBased,
      ...recommendations.locationBased,
      ...recommendations.activityBased,
    ]

    for (const rec of allRecommendations) {
      const userId = rec._id.toString()

      if (userMap.has(userId)) {
        const existing = userMap.get(userId)
        existing.score += rec.score
        existing.reasons.push(...rec.reasons)
      } else {
        userMap.set(userId, {
          _id: rec._id,
          name: rec.name,
          username: rec.username,
          profileImage: rec.profileImage,
          score: rec.score,
          reasons: [...rec.reasons],
        })
      }
    }

    return Array.from(userMap.values())
  }
}

export default new GroupService()
