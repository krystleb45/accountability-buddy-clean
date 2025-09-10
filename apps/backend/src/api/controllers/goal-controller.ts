import type { NextFunction, Request, Response } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"
import type { Goal } from "src/types/mongoose.gen"

import mongoose from "mongoose"

import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"
import { GoalService } from "../services/goal-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export const createGoal = catchAsync(
  async (
    req: AuthenticatedRequest<
      unknown,
      unknown,
      Pick<
        Goal,
        | "title"
        | "description"
        | "dueDate"
        | "category"
        | "tags"
        | "priority"
        | "visibility"
      >
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.user.id
    const data = req.body

    // Get user to check subscription limits
    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    const canCreateGoal = await GoalService.canUserCreateGoal(userId)

    if (!canCreateGoal.canCreate) {
      return next(
        createError(
          canCreateGoal.reason || "You cannot create more goals at this time",
          403,
        ),
      )
    }
    const createdGoal = await GoalService.createGoal(userId, {
      title: data.title,
      description: data.description || "", // Handle undefined description
      category: data.category,
      dueDate: data.dueDate,
      tags: data.tags || [],
      priority: data.priority || "medium",
      visibility: data.visibility || "private",
    })

    // console.log(`✅ Goal created successfully. New count: ${updatedActiveGoalCount}`);
    sendResponse(res, 201, true, "Goal created successfully", {
      goal: createdGoal,
    })

    next()
  },
)

export const getUserGoals = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id

    const goals = await GoalService.getUserGoals(userId)

    sendResponse(res, 200, true, "User goals retrieved successfully", { goals })
  },
)

export const getUserGoalCategories = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id

    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    const categories = await GoalService.getUserGoalCategories(userId)

    sendResponse(
      res,
      200,
      true,
      "User goal categories retrieved successfully",
      { categories },
    )
  },
)

export const getStreakDates = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id

    const user = await User.findById(userId)

    const dates = await GoalService.getStreakDates(userId)

    const hasAdvancedAnalytics = user.hasFeatureAccess("analytics")

    const isInTrial = user.isInTrial()

    // Add trial info for analytics features
    const responseData = {
      dates,
      analytics: {
        tier: user.subscriptionTier,
        hasAdvancedAnalytics,
        isInTrial,
        upgradePrompt: isInTrial
          ? "Enjoying streak tracking? Upgrade to keep advanced analytics after your trial!"
          : null,
      },
    }

    sendResponse(
      res,
      200,
      true,
      "Streak dates fetched successfully",
      responseData,
    )
  },
)

// Export all your other existing methods unchanged
export const getPublicGoals = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
    const goals = await GoalService.getPublicGoals()
    sendResponse(res, 200, true, "Public goals retrieved successfully", {
      goals,
    })
  },
)

export const updateGoalProgress = catchAsync(
  async (
    req: AuthenticatedRequest<
      { goalId: string },
      unknown,
      { progress: number }
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { goalId } = req.params
    const { progress } = req.body
    const userId = req.user.id

    await GoalService.trackProgress(goalId, userId, progress)

    sendResponse(res, 200, true, "Goal progress updated")

    next()
  },
)

export const getGoalById = catchAsync(
  async (
    req: AuthenticatedRequest<{ goalId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { goalId } = req.params
    if (!mongoose.isValidObjectId(goalId)) {
      return next(createError("Invalid goal ID", 400))
    }

    const userId = req.user.id

    const goal = await GoalService.getUserGoalById(userId, goalId, true)

    if (!goal) {
      return next(createError("Goal not found", 404))
    }

    const goalObj = goal.toObject()

    sendResponse(res, 200, true, "Goal retrieved successfully", {
      goal: goalObj,
    })
  },
)

export const completeGoal = catchAsync(
  async (
    req: AuthenticatedRequest<{ goalId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { goalId } = req.params
    if (!mongoose.isValidObjectId(goalId)) {
      return next(createError("Invalid goal ID", 400))
    }

    const userId = req.user!.id!

    const goal = await GoalService.completeGoal(goalId, userId)
    sendResponse(res, 200, true, "Goal marked as complete", { goal })
  },
)

export const updateGoal = catchAsync(
  async (
    req: AuthenticatedRequest<
      { goalId: string },
      unknown,
      Pick<
        Goal,
        | "title"
        | "description"
        | "dueDate"
        | "category"
        | "tags"
        | "priority"
        | "visibility"
      >
    >,
    res: Response,
    next: NextFunction,
  ) => {
    const { goalId } = req.params
    const data = req.body
    const userId = req.user.id

    const goal = await GoalService.updateGoal(goalId, userId, data)
    if (!goal) {
      return next(createError("Goal not found", 404))
    }

    sendResponse(res, 200, true, "Goal updated successfully", { goal })
  },
)

export const deleteGoal = catchAsync(
  async (
    req: AuthenticatedRequest<{ goalId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { goalId } = req.params
    const userId = req.user.id

    const success = await GoalService.deleteGoal(goalId, userId)
    if (!success) {
      return next(createError("Goal not found", 404))
    }

    sendResponse(res, 200, true, "Goal deleted successfully")
  },
)
