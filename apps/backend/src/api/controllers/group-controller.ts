import type { NextFunction, Response } from "express"

import { categories } from "@ab/shared/categories"
import z from "zod"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type {
  GetGroupsQueryParams,
  GroupMessagesQueryParams,
  SendGroupMessageBody,
  UpdateGroupBody,
} from "../routes/groups.js"

import { CustomError } from "../middleware/errorHandler.js"
import { FileUploadService } from "../services/file-upload-service.js"
import GroupService from "../services/group-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

const getGroupAvatarKey = (groupId: string) => `${groupId}-avatar`

/**
 * GET /api/groups - Get all groups with optional filters
 */
export const getGroups = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, unknown, GetGroupsQueryParams>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { category, search } = req.query

    const groups = await GroupService.getGroups(category, search)

    sendResponse(res, 200, true, "Groups retrieved successfully", { groups })
  },
)

/**
 * POST /api/groups - Create new group
 */
const createGroupSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(200),
  category: z.enum(categories.map((cat) => cat.id)),
  isPublic: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ),
  tags: z.preprocess(
    (val) => {
      if (Array.isArray(val)) return val
      if (typeof val === "string") return val.split(",").map((t) => t.trim()).filter(Boolean)
      return []
    },
    z.array(z.string().max(20)).max(5)
  ),
})

type CreateGroupFormData = z.infer<typeof createGroupSchema>

export const createGroup = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, CreateGroupFormData>,
    res: Response,
    _next: NextFunction,
  ) => {
    const formData = req.body
    const parsedData = createGroupSchema.safeParse(formData)

    if (!parsedData.success) {
      throw new CustomError("Invalid form data", 400, parsedData.error.issues)
    }

    if (!req.file) {
      throw new CustomError("Avatar image is required", 400)
    }

    const creatorId = req.user.id

    const group = await GroupService.createGroup({
      ...parsedData.data,
      privacy: parsedData.data.isPublic ? "public" : "private",
      creatorId,
    })

    const fileNameToSave = getGroupAvatarKey(group._id.toString())
    const { key } = await FileUploadService.uploadToS3({
      buffer: req.file.buffer,
      name: fileNameToSave,
      mimetype: req.file.mimetype,
    })

    await GroupService.updateAvatarImage(group._id.toString(), key)

    sendResponse(res, 201, true, "Group created successfully", { group })
  },
)

/**
 * GET /api/groups/my-groups - Get user's joined groups (ADDED MISSING FUNCTION)
 */
export const getMyGroups = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id
    const groups = await GroupService.getUserGroups(userId)
    sendResponse(res, 200, true, "Your groups retrieved successfully", {
      groups,
    })
  },
)

/**
 * GET /api/groups/:groupId - Get specific group details
 */
export const getGroupDetails = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id

    const group = await GroupService.getGroupDetails(groupId, userId)
    sendResponse(res, 200, true, "Group details retrieved successfully", {
      group,
    })
  },
)

/**
 * POST /api/groups/:groupId/join - Join a group
 */
export const joinGroup = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id

    await GroupService.joinGroup(groupId, userId, globalThis.io)

    sendResponse(res, 200, true, "Joined group successfully")
  },
)

/**
 * POST /api/groups/:groupId/leave - Leave a group
 */
export const leaveGroup = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user!.id

    await GroupService.leaveGroup(groupId, userId, globalThis.io)

    sendResponse(res, 200, true, "Left group successfully")
  },
)

/**
 * PUT /api/groups/:groupId - Update group (admin only)
 * Middleware: checkGroupExists, checkGroupAdmin
 */
export const updateGroup = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }, unknown, UpdateGroupBody>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id
    const updates = req.body

    // Group existence and admin status already verified by middleware
    await GroupService.updateGroup(groupId, userId, updates)
    sendResponse(res, 200, true, "Group updated successfully")
  },
)

/**
 * POST /api/groups/:groupId/request-invite - Request invitation to private group
 */
export const requestGroupInvite = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id

    await GroupService.requestGroupInvite(groupId, userId)

    sendResponse(res, 200, true, "Group invite requested successfully")
  },
)

/**
 * POST /api/groups/:groupId/invite - Invite user to group
 * Middleware: checkGroupExists, checkGroupAdmin
 */
export const inviteMember = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }, unknown, { userId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const { userId: inviteeId } = req.body
    const inviterId = req.user.id

    // Group existence and admin status already verified by middleware
    await GroupService.inviteMember(groupId, inviteeId, inviterId)
    sendResponse(res, 200, true, "Invitation sent successfully")
  },
)

/**
 * DELETE /api/groups/:groupId/remove/:userId - Remove member from group
 * Middleware: checkGroupExists, checkGroupAdmin
 */
export const removeMember = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string; userId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId, userId: memberToRemove } = req.params
    const adminId = req.user.id

    await GroupService.removeMember(
      groupId,
      memberToRemove,
      adminId,
      globalThis.io,
    )
    sendResponse(res, 200, true, "Member removed successfully")
  },
)

/**
 * GET /api/groups/:groupId/messages - Get group messages
 */
export const getGroupMessages = catchAsync(
  async (
    req: AuthenticatedRequest<
      { groupId: string },
      unknown,
      unknown,
      GroupMessagesQueryParams
    >,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id
    const { limit, page } = req.query

    const messages = await GroupService.getGroupMessages(groupId, userId, {
      limit,
      page,
    })

    sendResponse(
      res,
      200,
      true,
      "Group messages retrieved successfully",
      messages,
    )
  },
)

/**
 * POST /api/groups/:groupId/messages - Send group message
 */
export const sendGroupMessage = catchAsync(
  async (
    req: AuthenticatedRequest<
      { groupId: string },
      unknown,
      SendGroupMessageBody
    >,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const { content } = req.body
    const userId = req.user.id

    // Group existence and membership already verified by middleware
    await GroupService.sendGroupMessage(groupId, userId, content, globalThis.io)
    sendResponse(res, 201, true, "Message sent successfully")
  },
)

export const updateGroupAvatar = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id

    if (!req.file) {
      throw new CustomError("Avatar image file is required", 400)
    }

    const group = await GroupService.getGroupDetails(groupId, userId)

    if (!group.createdBy._id.equals(userId)) {
      throw new CustomError("Only group admins can update the avatar", 403)
    }

    const fileNameToSave = getGroupAvatarKey(groupId)
    await FileUploadService.uploadToS3({
      buffer: req.file.buffer,
      name: fileNameToSave,
      mimetype: req.file.mimetype,
    })

    sendResponse(res, 200, true, "Group avatar updated successfully")
  },
)

/**
 * GET /api/groups/invitations
 * Get user's group invites (both sent and received)
 */
export const getUserGroupInvitations = catchAsync(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user.id

    const invitations = await GroupService.getUserGroupInvitations(userId)

    sendResponse(res, 200, true, "Group invitations retrieved successfully", {
      invitations,
    })
  },
)

/**
 * GET /api/groups/:groupId/invitations - Get group invitations (admin only)
 */
export const getGroupInvitations = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id

    const invitations = await GroupService.getGroupInvitations(groupId, userId)

    sendResponse(res, 200, true, "Group invitations retrieved successfully", {
      invitations,
    })
  },
)

/**
 * POST /api/groups/invitations/:invitationId/accept - Accept a group invitation
 */
export const acceptGroupInvitation = catchAsync(
  async (
    req: AuthenticatedRequest<{ invitationId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { invitationId } = req.params
    const userId = req.user.id

    await GroupService.acceptGroupInvitation(invitationId, userId)

    sendResponse(res, 200, true, "Group invitation accepted successfully")
  },
)

/**
 * DELETE /api/groups/invitations/:invitationId/reject - Reject a group invitation
 */
export const rejectGroupInvitation = catchAsync(
  async (
    req: AuthenticatedRequest<{ invitationId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { invitationId } = req.params
    const userId = req.user.id

    await GroupService.rejectGroupInvitation(invitationId, userId)

    sendResponse(res, 200, true, "Group invitation rejected successfully")
  },
)

/**
 * GET /api/groups/:groupId/invite-recommendations - Get invite recommendations (admin only)
 */
export const getInviteRecommendations = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id

    const recommendations = await GroupService.getInviteRecommendations(
      groupId,
      userId,
    )

    sendResponse(
      res,
      200,
      true,
      "Invite recommendations retrieved successfully",
      { recommendations },
    )
  },
)

/**
 * GET /api/groups/:groupId/members - Get group members
 */
export const getGroupMembers = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { groupId } = req.params
    const userId = req.user.id

    const members = await GroupService.getGroupMembers(groupId, userId)

    sendResponse(res, 200, true, "Group members retrieved successfully", {
      members,
    })
  },
)
