import type { Response } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"

import type { CreateActivityData } from "../routes/activity"

import ActivityService from "../services/activity-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

interface QueryParams {
  type?: string
  limit?: string
  page?: string
}

/**
 * @desc    Create a new activity
 * @route   POST /api/activity
 * @access  Private
 */
export const createActivity = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, CreateActivityData>,
    res: Response,
  ): Promise<void> => {
    const userId = req.user.id

    const { type, description, metadata } = req.body

    const activity = await ActivityService.createActivity(
      userId,
      type,
      description,
      metadata,
    )
    sendResponse(res, 201, true, "Activity created successfully", { activity })
  },
)

/**
 * @desc    Get user activities with filtering & pagination
 * @route   GET /api/activity
 * @access  Private
 */
export const getUserActivities = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, any, any, QueryParams>,
    res: Response,
  ): Promise<void> => {
    const userId = req.user.id

    // validation handled by validate middleware
    const page = req.query.page as unknown as number
    const limit = req.query.limit as unknown as number
    const type = req.query.type

    const { activities, total } = await ActivityService.getUserActivities(
      userId,
      { type, page, limit },
    )

    sendResponse(res, 200, true, "User activities fetched successfully", {
      activities,
      total,
      pagination: { page, limit },
    })
  },
)

/**
 * @desc    Fetch all activities (admin only)
 * @route   GET /api/activities/all
 * @access  Private/Admin
 */
export const getAllActivities = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, any, any, QueryParams>,
    res: Response,
  ): Promise<void> => {
    // validation handled by validate middleware
    const page = req.query.page as unknown as number
    const limit = req.query.limit as unknown as number
    const type = req.query.type

    const { activities, total } = await ActivityService.getAllActivities({
      type,
      page,
      limit,
    })

    sendResponse(res, 200, true, "All activities fetched successfully", {
      activities,
      total,
      pagination: { page, limit },
    })
  },
)
