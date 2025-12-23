import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { FeedbackType } from "../models/Feedback.js"

import { createError } from "../middleware/errorHandler.js"
import FeedbackService from "../services/FeedbackService.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

// Define the valid feedback types (adjust these to match your actual FeedbackType values)
const VALID_FEEDBACK_TYPES = [
  "bug",
  "feature",
  "improvement",
  "general",
  "complaint",
  "praise",
  "other",
] as const

// Type guard to check if string is valid FeedbackType
function isValidFeedbackType(type: string): type is FeedbackType {
  return VALID_FEEDBACK_TYPES.includes(type as any)
}

/**
 * @desc    Submit user feedback
 * @route   POST /api/feedback
 * @access  Private
 */
export const submitFeedback = catchAsync(
  async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id
    if (!userId) {
      throw createError("Unauthorized", 401)
    }

    const { message, type } = req.body as { message: string; type: string }

    // Validate feedback type
    if (!type || !isValidFeedbackType(type)) {
      throw createError(
        `Invalid feedback type. Must be one of: ${VALID_FEEDBACK_TYPES.join(", ")}`,
        400,
      )
    }

    // Validate message
    if (!message || !message.trim()) {
      throw createError("Message is required", 400)
    }

    // Now type is properly typed as FeedbackType
    const feedback = await FeedbackService.submitFeedback(
      userId,
      message.trim(),
      type,
    )

    sendResponse(res, 201, true, "Feedback submitted successfully", {
      feedback,
    })
  },
)

/**
 * @desc    Get feedback submitted by the authenticated user
 * @route   GET /api/feedback
 * @access  Private
 */
export const getUserFeedback = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id
    if (!userId) {
      throw createError("Unauthorized", 401)
    }

    const list = await FeedbackService.getUserFeedback(userId)
    sendResponse(res, 200, true, "User feedback retrieved successfully", {
      feedback: list,
    })
  },
)

/**
 * @desc    Delete feedback by ID
 * @route   DELETE /api/feedback/:feedbackId
 * @access  Private
 */
export const deleteFeedback = catchAsync(
  async (
    req: AuthenticatedRequest<{ feedbackId: string }>,
    res: Response,
  ): Promise<void> => {
    const userId = req.user?.id
    if (!userId) {
      throw createError("Unauthorized", 401)
    }

    const { feedbackId } = req.params

    // Validate feedbackId
    if (!feedbackId) {
      throw createError("Feedback ID is required", 400)
    }

    await FeedbackService.deleteFeedback(userId, feedbackId)
    sendResponse(res, 200, true, "Feedback deleted successfully")
  },
)

export default {
  submitFeedback,
  getUserFeedback,
  deleteFeedback,
}
