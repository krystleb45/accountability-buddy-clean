// src/api/controllers/goalController.ts - FIXED: TypeScript errors
import type { NextFunction, Request, Response } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"

import mongoose from "mongoose"

import { createError } from "../middleware/errorHandler"
import { Reminder } from "../models/Reminder"
import { User } from "../models/User"
import { GoalService } from "../services/goal-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

// Helper function for goal limits
function getGoalLimitForTier(tier: string): number {
  const goalLimits: Record<string, number> = {
    "free-trial": -1, // unlimited
    basic: 3,
    pro: -1, // unlimited
    elite: -1, // unlimited
  }
  return goalLimits[tier] ?? 3
}

export const createGoal = catchAsync(
  async (
    req: Request<
      unknown,
      unknown,
      {
        title: string
        description?: string
        deadline: string
        category: string
      }
    >,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    if (!userId) {
      return next(createError("Unauthorized", 401))
    }

    const { title, description, deadline, category } = req.body
    if (!title || !deadline || !category) {
      return next(createError("Title, deadline and category are required", 400))
    }

    // Parse + validate date
    const due = new Date(deadline)
    if (Number.isNaN(due.getTime())) {
      return next(createError("Invalid date format", 400))
    }

    // Get user to check subscription limits
    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    const canCreateGoal = await GoalService.canUserCreateGoal(userId)
    const goalLimit = canCreateGoal.maxAllowed

    if (!canCreateGoal.canCreate) {
      return next(
        createError(
          canCreateGoal.reason || "You cannot create more goals at this time",
          403,
        ),
      )
    }

    // console.log("✅ Goal creation allowed");

    // Create the goal - FIXED: Pass description properly
    const createdGoal = await GoalService.createGoal(userId, {
      title,
      description: description || "", // Handle undefined description
      category,
      dueDate: due,
    })

    // Get updated count after creation - FIXED: Use correct variable name
    const updatedActiveGoalCount = await GoalService.getActiveGoalCount(userId)

    // Include subscription info in response for frontend
    const responseData = {
      goal: createdGoal, // FIXED: Use the returned goal
      subscription: {
        tier: user.subscriptionTier,
        goalLimit,
        currentGoalCount: updatedActiveGoalCount,
        hasUnlimitedGoals: goalLimit === -1,
        canCreateMore: goalLimit === -1 || updatedActiveGoalCount < goalLimit,
      },
    }

    // console.log(`✅ Goal created successfully. New count: ${updatedActiveGoalCount}`);
    sendResponse(res, 201, true, "Goal created successfully", responseData)
  },
)

export const getUserGoals = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    if (!userId) {
      return next(createError("Unauthorized", 401))
    }

    // Get user subscription info
    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    const goals = await GoalService.getUserGoals(userId)
    const activeGoalCount = await GoalService.getActiveGoalCount(userId)

    // FIXED: Use helper functions instead of user methods
    const goalLimit = getGoalLimitForTier(user.subscriptionTier)
    const hasUnlimitedGoals = goalLimit === -1
    const canCreateMore = goalLimit === -1 || activeGoalCount < goalLimit

    // Helper functions for trial info
    const isInTrial = (): boolean => {
      if (user.subscription_status === "trial" && user.trial_end_date) {
        return new Date() < new Date(user.trial_end_date)
      }
      return false
    }

    const getDaysUntilTrialEnd = (): number => {
      if (!user.trial_end_date) {
        return 0
      }
      const now = new Date()
      const trialEnd = new Date(user.trial_end_date)
      const diffTime = trialEnd.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    }

    // Include subscription limits in response
    const responseData = {
      goals,
      subscription: {
        tier: user.subscriptionTier,
        goalLimit,
        currentGoalCount: activeGoalCount,
        hasUnlimitedGoals,
        canCreateMore,
        isInTrial: isInTrial(),
        daysUntilTrialEnd: getDaysUntilTrialEnd(),
      },
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

export default {
  createGoal,
  getPublicGoals,
  getUserGoals,
  getStreakDates,
  updateGoalProgress,
  completeGoal,
  updateGoal,
  deleteGoal,
  getGoalById,
}
