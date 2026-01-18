import type { Response } from "express"

import { Router } from "express"
import z from "zod"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"

import { protect } from "../middleware/auth-middleware.js"
import validate from "../middleware/validation-middleware.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"
import CollaborationGoalService from "../services/collaboration-goal-service.js"

const router = Router()

// ==================== GOAL CRUD ====================

/**
 * POST /api/collaboration-goals
 * Create a new collaboration goal
 */
const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  target: z.number().min(1).max(1000000).optional().default(100),
  category: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional().default("private"),
})

router.post(
  "/",
  protect,
  validate({ bodySchema: createGoalSchema }),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const goal = await CollaborationGoalService.create(req.user.id, req.body)
    sendResponse(res, 201, true, "Collaboration goal created", { goal })
  })
)

/**
 * GET /api/collaboration-goals
 * Get all collaboration goals for the current user
 */
router.get(
  "/",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const goals = await CollaborationGoalService.getForUser(req.user.id)
    sendResponse(res, 200, true, "Collaboration goals fetched", { goals })
  })
)

/**
 * GET /api/collaboration-goals/invitations
 * Get pending invitations for the current user
 */
router.get(
  "/invitations",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const invitations = await CollaborationGoalService.getPendingInvitations(req.user.id)
    sendResponse(res, 200, true, "Invitations fetched", { invitations })
  })
)

/**
 * GET /api/collaboration-goals/:id
 * Get a single collaboration goal by ID
 */
router.get(
  "/:id",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const goal = await CollaborationGoalService.getById(req.params.id, req.user.id)
    sendResponse(res, 200, true, "Collaboration goal fetched", { goal })
  })
)

/**
 * PUT /api/collaboration-goals/:id
 * Update a collaboration goal (creator only)
 */
const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  target: z.number().min(1).max(1000000).optional(),
  category: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
})

router.put(
  "/:id",
  protect,
  validate({ bodySchema: updateGoalSchema }),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const goal = await CollaborationGoalService.update(
      req.params.id,
      req.user.id,
      req.body
    )
    sendResponse(res, 200, true, "Collaboration goal updated", { goal })
  })
)

/**
 * DELETE /api/collaboration-goals/:id
 * Delete a collaboration goal (creator only)
 */
router.delete(
  "/:id",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    await CollaborationGoalService.delete(req.params.id, req.user.id)
    sendResponse(res, 200, true, "Collaboration goal deleted")
  })
)

// ==================== PROGRESS ====================

/**
 * POST /api/collaboration-goals/:id/progress
 * Update progress on a goal (any participant)
 * Now supports optional note for activity feed
 */
const progressSchema = z.object({
  increment: z.number().min(1).max(1000000),
  note: z.string().max(200).optional(),
})

router.post(
  "/:id/progress",
  protect,
  validate({ bodySchema: progressSchema }),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const goal = await CollaborationGoalService.updateProgress(
      req.params.id,
      req.user.id,
      req.body.increment,
      req.body.note
    )
    sendResponse(res, 200, true, "Progress updated", { goal })
  })
)

// ==================== INVITATIONS ====================

/**
 * POST /api/collaboration-goals/:id/invitations
 * Send invitations to friends
 */
const sendInvitationsSchema = z.object({
  recipientIds: z.array(z.string()).min(1).max(20),
  message: z.string().max(500).optional(),
})

router.post(
  "/:id/invitations",
  protect,
  validate({ bodySchema: sendInvitationsSchema }),
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const invitations = await CollaborationGoalService.sendInvitations(
      req.params.id,
      req.user.id,
      req.body.recipientIds,
      req.body.message
    )
    sendResponse(res, 201, true, "Invitations sent", { invitations })
  })
)

/**
 * GET /api/collaboration-goals/:id/invitations
 * Get sent invitations for a goal (creator only)
 */
router.get(
  "/:id/invitations",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const invitations = await CollaborationGoalService.getSentInvitations(
      req.params.id,
      req.user.id
    )
    sendResponse(res, 200, true, "Sent invitations fetched", { invitations })
  })
)

/**
 * POST /api/collaboration-goals/invitations/:invitationId/accept
 * Accept an invitation
 */
router.post(
  "/invitations/:invitationId/accept",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const invitation = await CollaborationGoalService.acceptInvitation(
      req.params.invitationId,
      req.user.id
    )
    sendResponse(res, 200, true, "Invitation accepted", { invitation })
  })
)

/**
 * POST /api/collaboration-goals/invitations/:invitationId/decline
 * Decline an invitation
 */
router.post(
  "/invitations/:invitationId/decline",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const invitation = await CollaborationGoalService.declineInvitation(
      req.params.invitationId,
      req.user.id
    )
    sendResponse(res, 200, true, "Invitation declined", { invitation })
  })
)

/**
 * DELETE /api/collaboration-goals/invitations/:invitationId
 * Cancel a pending invitation (sender or creator)
 */
router.delete(
  "/invitations/:invitationId",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    await CollaborationGoalService.cancelInvitation(
      req.params.invitationId,
      req.user.id
    )
    sendResponse(res, 200, true, "Invitation cancelled")
  })
)

// ==================== PARTICIPANTS ====================

/**
 * POST /api/collaboration-goals/:id/leave
 * Leave a collaboration goal (participant)
 */
router.post(
  "/:id/leave",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    await CollaborationGoalService.leaveGoal(req.params.id, req.user.id)
    sendResponse(res, 200, true, "Left the collaboration goal")
  })
)

/**
 * DELETE /api/collaboration-goals/:id/participants/:participantId
 * Remove a participant (creator only)
 */
router.delete(
  "/:id/participants/:participantId",
  protect,
  catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const goal = await CollaborationGoalService.removeParticipant(
      req.params.id,
      req.user.id,
      req.params.participantId
    )
    sendResponse(res, 200, true, "Participant removed", { goal })
  })
)

export default router
