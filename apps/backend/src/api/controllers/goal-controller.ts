import type { NextFunction, Response } from "express"

import mongoose from "mongoose"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { Goal } from "../../types/mongoose.gen.js"

import { createError } from "../middleware/errorHandler.js"
import { User } from "../models/User.js"
import { GoalService } from "../services/goal-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

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
      description: data.description || "",
      category: data.category,
      dueDate: data.dueDate,
      tags: data.tags || [],
      priority: data.priority || "medium",
      visibility: data.visibility || "private",
    })

    // Attach activity data for middleware
    req.activityData = {
      goalTitle: createdGoal.title,
      goalId: createdGoal._id.toString(),
    }

    sendResponse(res, 201, true, "Goal created successfully", {
      goal: createdGoal,
    })

    
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

    // Get goal first to have title for activity
    const goal = await GoalService.getUserGoalById(userId, goalId)
    if (!goal) {
      return next(createError("Goal not found", 404))
    }

    await GoalService.trackProgress(goalId, userId, progress)

    // Attach activity data for middleware
    req.activityData = {
      goalTitle: goal.title,
      goalId: goalId,
      progress: progress,
    }

    sendResponse(res, 200, true, "Goal progress updated")

    
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

export const getPublicGoalsByMemberUsername = catchAsync(
  async (
    req: AuthenticatedRequest<{ username: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { username } = req.params

    const member = await User.findOne({ username })
    if (!member) {
      return next(createError("Member not found", 404))
    }

    const goals = await GoalService.getUserPublicGoals(member._id.toString())

    sendResponse(res, 200, true, "Member's public goals retrieved", { goals })
  },
)