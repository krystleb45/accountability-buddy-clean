import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { RecentMessageQuery } from "../routes/messages.js"

import { MessageService } from "../services/message-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

/**
 * GET /api/messages/recent
 * Get recent messages for dashboard
 */
export const getRecentMessages = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, unknown, RecentMessageQuery>,
    res: Response,
  ) => {
    const userId = req.user.id
    const { limit } = req.query

    const messages = await MessageService.getRecentMessages(userId, limit)

    sendResponse(res, 200, true, "Recent messages fetched successfully", {
      messages,
    })
  },
)

/**
 * GET /api/messages/unread-count
 * Get unread message count for the authenticated user
 */
export const getUnreadCount = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id

    const count = await MessageService.getUnreadCount(userId)

    sendResponse(res, 200, true, "Unread count fetched successfully", {
      count,
    })
  },
)
