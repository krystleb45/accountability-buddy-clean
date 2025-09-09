import type { NextFunction, Request, Response } from "express"
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

interface UpdateBody {
  title?: string
  description?: string
  metadata?: Record<string, unknown>
}

/**
 * @desc    Log user activity (alias for createActivity/logging endpoint)
 * @route   POST /api/activity/log
 * @access  Private
 */
export const logActivity = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, any, CreateActivityData>,
    res: Response,
  ): Promise<void> => {
    const userId = req.user.id

    const { type, description, metadata } = req.body

    const activity = await ActivityService.logActivity(
      userId,
      type,
      description,
      metadata,
    )
    sendResponse(res, 201, true, "Activity logged successfully", { activity })
  },
)

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
 * @desc    Fetch one activity by ID
 * @route   GET /api/activity/:activityId
 * @access  Private
 */
export const getActivityById = catchAsync(
  async (
    req: Request<{ activityId: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const { activityId } = req.params
    const activity = await ActivityService.getActivityById(activityId)
    sendResponse(res, 200, true, "Activity fetched successfully", { activity })
  },
)

/**
 * @desc    Update an existing activity
 * @route   PUT /api/activity/:activityId
 * @access  Private
 */
export const updateActivity = catchAsync(
  async (
    req: Request<{ activityId: string }, any, UpdateBody>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const { activityId } = req.params
    const updates = req.body
    const activity = await ActivityService.updateActivity(
      req.user!.id,
      activityId,
      updates,
    )
    sendResponse(res, 200, true, "Activity updated successfully", { activity })
  },
)

/**
 * @desc    Join an activity
 * @route   POST /api/activity/:activityId/join
 * @access  Private
 */
export const joinActivity = catchAsync(
  async (
    req: Request<{ activityId: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const { activityId } = req.params
    const activity = await ActivityService.joinActivity(
      req.user!.id,
      activityId,
    )
    sendResponse(res, 200, true, "Joined activity successfully", { activity })
  },
)

/**
 * @desc    Leave an activity
 * @route   POST /api/activity/:activityId/leave
 * @access  Private
 */
export const leaveActivity = catchAsync(
  async (
    req: Request<{ activityId: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const { activityId } = req.params
    const activity = await ActivityService.leaveActivity(
      req.user!.id,
      activityId,
    )
    sendResponse(res, 200, true, "Left activity successfully", { activity })
  },
)

/**
 * @desc    Soft-delete an activity
 * @route   DELETE /api/activity/:activityId
 * @access  Private
 */
export const deleteActivity = catchAsync(
  async (
    req: Request<{ activityId: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const { activityId } = req.params
    await ActivityService.deleteActivity(req.user!.id, activityId)
    sendResponse(res, 200, true, "Activity deleted successfully")
  },
)

export default {
  logActivity,
  createActivity,
  getUserActivities,
  getActivityById,
  updateActivity,
  joinActivity,
  leaveActivity,
  deleteActivity,
}
