import { categories } from "@ab/shared/categories"
import { Router } from "express"
import rateLimit from "express-rate-limit"
import z from "zod"

import * as groupController from "../controllers/group-controller"
import { protect } from "../middleware/auth-middleware"
import { validateSubscription } from "../middleware/subscription-validation"
import validate from "../middleware/validation-middleware"
import { FileUploadService } from "../services/file-upload-service"

const router = Router()
const groupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many group requests",
})

/**
 * GET /api/groups - Get all groups with optional filters
 */
const getGroupsQuerySchema = z.object({
  category: z.enum(categories.map((c) => c.id)).optional(),
  search: z.string().optional(),
})

export type GetGroupsQueryParams = z.infer<typeof getGroupsQuerySchema>

router.get(
  "/",
  protect,
  validate({ querySchema: getGroupsQuerySchema }),
  groupController.getGroups,
)

/**
 * POST /api/groups - Create a new group
 */
router.post(
  "/",
  protect,
  validateSubscription,
  groupLimiter,
  FileUploadService.multerUpload.single("avatar"),
  groupController.createGroup,
)

/**
 * GET /api/groups/my-groups - Get groups the user is a member of
 */
router.get("/my-groups", protect, groupController.getMyGroups)

/**
 * GET /api/groups/invitations
 * Get user's group invites (both sent and received)
 */
router.get("/invitations", protect, groupController.getUserGroupInvitations)

/**
 * POST /api/groups/invitations/:invitationId/accept
 * Accept a group invitation
 */
router.post(
  "/invitations/:invitationId/accept",
  protect,
  groupLimiter,
  groupController.acceptGroupInvitation,
)

/**
 * DELETE /api/groups/invitations/:invitationId/reject
 * Reject a group invitation (admin only)
 */
router.delete(
  "/invitations/:invitationId/reject",
  protect,
  groupLimiter,
  groupController.rejectGroupInvitation,
)

/**
 * GET /api/groups/:groupId - Get group details
 */
router.get(
  "/:groupId",
  protect,
  validate({
    paramsSchema: z.object({
      groupId: z.string().nonempty(),
    }),
  }),
  groupController.getGroupDetails,
)

/**
 * GET /api/groups/:groupId/members - Get group members
 */
router.get("/:groupId/members", protect, groupController.getGroupMembers)

/**
 * POST /api/groups/:groupId/join - Join a group
 */
router.post("/:groupId/join", protect, groupLimiter, groupController.joinGroup)

/**
 * POST /api/groups/:groupId/leave - Leave a group
 */
router.post(
  "/:groupId/leave",
  protect,
  groupLimiter,
  groupController.leaveGroup,
)

/**
 * PUT /api/groups/:groupId - Update group (admin only)
 */
const updateGroupBodySchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  category: z.enum(categories.map((cat) => cat.id)),
  tags: z.array(z.string().max(20)).max(5),
  isPublic: z.boolean(),
})
export type UpdateGroupBody = z.infer<typeof updateGroupBodySchema>

router.put(
  "/:groupId",
  protect,
  groupLimiter,
  validate({ bodySchema: updateGroupBodySchema }),
  groupController.updateGroup,
)

// DELETE /api/groups/:groupId - Delete group (admin only)
router.delete("/:groupId", protect, groupLimiter, groupController.deleteGroup)

/**
 * POST /api/groups/:groupId/request-invite - Request invitation to private group
 */
router.post(
  "/:groupId/request-invite",
  protect,
  groupLimiter,
  groupController.requestGroupInvite,
)

/**
 * GET /api/groups/:groupId/invite-recommendations - Get invite recommendations (admin only)
 */
router.get(
  "/:groupId/invite-recommendations",
  protect,
  groupLimiter,
  groupController.getInviteRecommendations,
)

// POST /api/groups/:groupId/invite - Invite user to group (admin only)
router.post(
  "/:groupId/invite",
  protect,
  groupLimiter,
  validate({
    bodySchema: z.object({
      userId: z.string().nonempty(),
    }),
  }),
  groupController.inviteMember,
)

/**
 * DELETE /api/groups/:groupId/remove/:userId - Remove member from group (admin only)
 */
router.delete(
  "/:groupId/remove/:userId",
  protect,
  groupLimiter,
  groupController.removeMember,
)

/**
 * GET /api/groups/:groupId/messages - Get group messages (members only)
 */
const queryParamsSchema = z.object({
  limit: z.coerce
    .number()
    .min(1, { message: "Limit must be at least 1" })
    .max(100, { message: "Limit cannot exceed 100" })
    .optional(),
  page: z.coerce
    .number()
    .min(1, { message: "Page must be at least 1" })
    .optional(),
})
export type GroupMessagesQueryParams = z.infer<typeof queryParamsSchema>

router.get(
  "/:groupId/messages",
  protect,
  validate({ querySchema: queryParamsSchema }),
  groupController.getGroupMessages,
)

/**
 * GET /api/groups/:groupId/messages - Send group message
 */
const sendMessageBodySchema = z.object({
  content: z
    .string()
    .min(1, { message: "Message content cannot be empty" })
    .max(1000, { message: "Message content cannot exceed 1000 characters" })
    .trim(),
})

export type SendGroupMessageBody = z.infer<typeof sendMessageBodySchema>

router.post(
  "/:groupId/messages",
  protect,
  groupLimiter,
  validate({ bodySchema: sendMessageBodySchema }),
  groupController.sendGroupMessage,
)

/**
 * PUT /api/groups/:groupId/avatar - Update group avatar (admin only)
 */
router.put(
  "/:groupId/avatar",
  protect,
  groupLimiter,
  FileUploadService.multerUpload.single("image"),
  groupController.updateGroupAvatar,
)

/**
 * GET /api/groups/:groupId/invitations - Get group invitations (admin only)
 */
router.get(
  "/:groupId/invitations",
  protect,
  groupLimiter,
  groupController.getGroupInvitations,
)

export default router
