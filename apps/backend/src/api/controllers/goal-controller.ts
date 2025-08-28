import type { NextFunction, Request, Response } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"
import type { Goal } from "src/types/mongoose.gen"

import mongoose from "mongoose"

import { createError } from "../middleware/errorHandler"
import { Reminder } from "../models/Reminder"
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
  },
)

export const getUserGoals = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user.id

    // Get user subscription info
    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    const goals = await GoalService.getUserGoals(userId)

    // Include subscription limits in response
    const responseData = {
      goals,
    }

    sendResponse(
      res,
      200,
      true,
      "User goals retrieved successfully",
      responseData,
    )
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

// Keep your other methods the same, just fix the ones with user method calls
export const getStreakDates = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    if (!userId) {
      return next(createError("Unauthorized", 401))
    }

    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

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
    req: AuthenticatedRequest<{ goalId: string }, { progress: number }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { goalId } = req.params
    if (!mongoose.isValidObjectId(goalId)) {
      return next(createError("Invalid goal ID", 400))
    }

    const userId = req.user!.id!

    const goal = await GoalService.trackProgress(
      goalId,
      userId,
      req.body.progress,
    )

    sendResponse(res, 200, true, "Goal progress updated", { goal })
  },
)

export const getGoalById = catchAsync(
  async (
    req: Request<{ goalId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { goalId } = req.params
    if (!mongoose.isValidObjectId(goalId)) {
      return next(createError("Invalid goal ID", 400))
    }
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    if (!userId) {
      return next(createError("Unauthorized", 401))
    }

    const goal = await GoalService.getUserGoalById(userId, goalId)
    if (!goal) {
      return next(createError("Goal not found", 404))
    }

    const reminders = await Promise.all(
      goal.reminders.map(async (r) => {
        const userReminder = await Reminder.findById(r._id)
        return {
          id: userReminder._id.toString(),
          date: userReminder.remindAt.toISOString().slice(0, 10),
          time: userReminder.remindAt.toISOString().slice(11, 16),
        }
      }),
    )

    const goalObj = goal.toObject()

    const safe = {
      ...goalObj,
      reminders,
    }

    res.status(200).json({ success: true, message: "Goal fetched", data: safe })
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
      {
        title?: string
        description?: string
        deadline?: string
        category?: string
      }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    const { goalId } = req.params
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    if (!userId) {
      return next(createError("Unauthorized", 401))
    }

    // Build partial update object explicitly
    const updates: {
      title?: string
      description?: string
      dueDate?: Date
      category?: string
    } = {}

    if (req.body.title !== undefined) {
      updates.title = req.body.title
    }
    if (req.body.description !== undefined) {
      updates.description = req.body.description
    }
    if (req.body.category !== undefined) {
      updates.category = req.body.category
    }
    if (req.body.deadline) {
      const d = new Date(req.body.deadline)
      if (Number.isNaN(d.getTime())) {
        return next(createError("Invalid date format", 400))
      }
      updates.dueDate = d
    }

    const goal = await GoalService.updateGoal(goalId, userId, updates)
    if (!goal) {
      return next(createError("Goal not found", 404))
    }

    sendResponse(res, 200, true, "Goal updated successfully", { goal })
  },
)

export const deleteGoal = catchAsync(
  async (
    req: Request<{ goalId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { goalId } = req.params
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    if (!userId) {
      return next(createError("Unauthorized", 401))
    }

    const success = await GoalService.deleteGoal(goalId, userId)
    if (!success) {
      return next(createError("Goal not found", 404))
    }

    sendResponse(res, 200, true, "Goal deleted successfully", {})
  },
)
