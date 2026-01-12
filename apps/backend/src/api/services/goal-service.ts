import { format, startOfDay } from "date-fns"
import status from "http-status"
import mongoose from "mongoose"
import { uniqueWith } from "remeda"

import type { Goal as IGoal, UserDocument } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import { CustomError } from "../middleware/errorHandler.js"
import { Goal } from "../models/Goal.js"
import { User } from "../models/User.js"
import GamificationService from "./gamification-service.js"
import { ReminderService } from "./reminder-service.js"
import { UserService } from "./user-service.js"

export class GoalService {
  /**
   * Fetch all public (non-archived) goals.
   */
  static async getPublicGoals() {
    const goals = await Goal.find({ status: { $ne: "archived" } })
      .sort({ createdAt: -1 })
      .exec()
    return goals
  }

  /**
   * Fetch all goals for a given user.
   */
  static async getUserGoals(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID", 400)
    }
    return await Goal.find({ user: userId }).sort({ createdAt: -1 }).exec()
  }

  /**
   * Get all unique goal categories for a user.
   */
  static async getUserGoalCategories(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID", 400)
    }

    return (await Goal.distinct("category", {
      user: userId,
    }).exec()) as string[]
  }

  /**
   * Get count of active goals for subscription limit checking
   */
  static async getActiveGoalCount(userId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID", 400)
    }

    return await Goal.countDocuments({
      user: userId,
      status: { $in: ["not-started", "in-progress"] },
    })
  }

  /**
   * Check if user can create more goals based on their subscription
   */
  static async canUserCreateGoal(userId: string) {
    try {
      const user = await UserService.getUserById(userId)

      // Check subscription status first
      if (!user.isSubscriptionActive()) {
        throw new CustomError("Active subscription required", status.FORBIDDEN)
      }

      const currentCount = await this.getActiveGoalCount(userId)
      const maxAllowed = user.getGoalLimit()

      // Unlimited goals (returns -1)
      if (maxAllowed === -1) {
        return {
          canCreate: true,
          currentCount,
          maxAllowed: -1,
        }
      }

      // Check limit
      const canCreate = currentCount < maxAllowed

      return {
        canCreate,
        reason: canCreate
          ? undefined
          : `Goal limit reached (${currentCount}/${maxAllowed})`,
        currentCount,
        maxAllowed,
      }
    } catch (error) {
      logger.error(
        `❌ Error checking goal creation eligibility for user ${userId}:`,
        error,
      )
      throw error
    }
  }

  /**
   * Get streak dates for a user's completed goals
   */
  static async getStreakDates(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID", 400)
    }

    const completed = await Goal.find({
      user: userId,
      status: "completed",
      completedAt: { $exists: true },
    })
      .select("completedAt")
      .exec()

    return uniqueWith(
      completed.map((g) => startOfDay(g.completedAt!)).sort(),
      (a, b) => a.getTime() === b.getTime(),
    )
  }

  /**
   * Track progress on a goal; if ≥100, mark complete.
   */
  static async trackProgress(goalId: string, userId: string, progress: number) {
    if (
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new CustomError("Invalid goal or user ID", 400)
    }

    const goal = await Goal.findById(goalId)
    if (!goal) {
      throw new CustomError("Goal not found", 404)
    }

    if (goal.user.toString() !== userId) {
      throw new CustomError("Not authorized to update this goal", 403)
    }

    const oldProgress = goal.progress
    const newProgress = Math.min(100, Math.max(0, progress))
    goal.progress = newProgress

    // Award XP for reaching milestones (25%, 50%, 75%)
    const milestones = [25, 50, 75]
    for (const milestone of milestones) {
      if (oldProgress < milestone && newProgress >= milestone) {
        await GamificationService.addPoints(userId, 5)
        logger.info(
          `User ${userId} reached ${milestone}% milestone on goal ${goalId}`,
        )
      }
    }

    if (newProgress >= 100) {
      goal.status = "completed"
      goal.completedAt = new Date()
      await GamificationService.addPoints(userId, goal.points)
      logger.info(`User ${userId} completed goal ${goalId}`)
      
      // Delete pending reminders for completed goal
      await ReminderService.deleteGoalReminders(goalId)
    } else if (newProgress > 0) {
      goal.status = "in-progress"
    }
    await goal.save()
    await GamificationService.checkAndAwardBadges(userId, "goal_completed")
  }

  /**
   * Mark a goal fully complete.
   */
  static async completeGoal(goalId: string, userId: string): Promise<IGoal> {
    if (
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new CustomError("Invalid goal or user ID", 400)
    }
    const goal = await Goal.findById(goalId)
    if (!goal) {
      throw new CustomError("Goal not found", 404)
    }
    if (goal.user.toString() !== userId) {
      throw new CustomError("Not authorized to complete this goal", 403)
    }

    goal.progress = 100
    goal.status = "completed"
    goal.completedAt = new Date()
    await goal.save()
    
    // Delete pending reminders for completed goal
    await ReminderService.deleteGoalReminders(goalId)
    
    await GamificationService.checkAndAwardBadges(userId, "goal_completed")
    logger.info(`User ${userId} completed goal ${goalId}`)
    return goal
  }

  /**
   * Fetch a specific user's goal by ID.
   */
  static async getUserGoalById(
    userId: string,
    goalId: string,
    populate = false,
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(goalId)
    ) {
      throw new CustomError("Invalid ID", 400)
    }

    if (populate) {
      return Goal.findOne({ _id: goalId, user: userId })
        .populate("reminders")
        .populate("milestones")
        .exec()
    }

    return Goal.findOne({ _id: goalId, user: userId }).exec()
  }

  /**
   * Create a new goal.
   * @param enableReminders - If true, auto-create deadline reminders (default: true)
   */
  static async createGoal(
    userId: string,
    data: Pick<
      IGoal,
      | "title"
      | "description"
      | "dueDate"
      | "category"
      | "tags"
      | "priority"
      | "visibility"
    >,
    enableReminders = true,
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID", 400)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new CustomError("User not found", 404)
    }

    const goal = new Goal({
      user: userId,
      progress: 0,
      status: "not-started",
      milestones: [],
      tags: [],
      priority: "medium",
      isPinned: false,
      points: 25,
      completedAt: undefined,
      ...data,
    })

    await goal.save()
    logger.info(`Goal created for user ${userId}: ${goal._id}`)

    // Auto-create reminders if enabled and goal has a due date
    if (enableReminders && goal.dueDate) {
      try {
        await ReminderService.createGoalReminders(userId, goal._id.toString())
      } catch (error) {
        // Don't fail goal creation if reminders fail
        logger.error(`Failed to create auto-reminders for goal ${goal._id}:`, error)
      }
    }

    return goal
  }

  /**
   * Update a goal's details (title, description, dueDate, category).
   */
  static async updateGoal(
    goalId: string,
    userId: string,
    updates: Partial<IGoal>,
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new CustomError("Invalid goal or user ID", 400)
    }

    const existingGoal = await Goal.findOne({ _id: goalId, user: userId })
    if (!existingGoal) {
      return null
    }

    // Check if due date is being updated
    const dueDateChanged = updates.dueDate && 
      updates.dueDate.toString() !== existingGoal.dueDate?.toString()

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, user: userId },
      { $set: updates },
      { new: true },
    ).exec()

    if (!goal) {
      return null
    }

    // If due date changed, recreate reminders
    if (dueDateChanged && goal.dueDate) {
      try {
        await ReminderService.deleteGoalReminders(goalId)
        await ReminderService.createGoalReminders(userId, goalId)
        logger.info(`Reminders updated for goal ${goalId} due to date change`)
      } catch (error) {
        logger.error(`Failed to update reminders for goal ${goalId}:`, error)
      }
    }

    return goal
  }

  /**
   * Permanently delete a goal.
   */
  static async deleteGoal(goalId: string, userId: string) {
    if (
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new CustomError("Invalid goal or user ID", 400)
    }

    // Delete associated reminders first
    await ReminderService.deleteGoalReminders(goalId)

    const result = await Goal.deleteOne({ _id: goalId, user: userId }).exec()

    return result.deletedCount === 1
  }

  /**
   * Get subscription-aware goal summary for user
   */
  static async getGoalSummaryWithLimits(userId: string) {
    try {
      const user: UserDocument = await User.findById(userId)
      if (!user) {
        throw new CustomError("User not found", 404)
      }

      const [totalGoals, activeGoals, completedGoals] = await Promise.all([
        Goal.countDocuments({ user: userId }),
        Goal.countDocuments({
          user: userId,
          status: { $in: ["not-started", "in-progress"] },
        }),
        Goal.countDocuments({
          user: userId,
          status: "completed",
        }),
      ])

      const goalLimit = user.getGoalLimit()
      const isUnlimited = goalLimit === -1

      return {
        totalGoals,
        activeGoals,
        completedGoals,
        subscription: {
          tier: user.subscriptionTier,
          canCreateMore: isUnlimited || activeGoals < goalLimit,
          goalLimit,
          isUnlimited,
        },
      }
    } catch (error) {
      logger.error(`❌ Error getting goal summary for user ${userId}:`, error)
      throw error
    }
  }

  static async getGoalTrends(userId: string) {
    const goals = await Goal.find({
      user: userId,
      completedAt: { $exists: true },
    })

    return goals.reduce(
      (acc, goal) => {
        const date = format(goal.completedAt!, "yyyy-MM-dd")
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  static async getCategoryBreakdown(userId: string) {
    const goals = await Goal.find({ user: userId })

    return goals.reduce(
      (acc, goal) => {
        const category = goal.category
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  static async getUserPublicGoals(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID", 400)
    }

    return await Goal.find({
      user: userId,
      visibility: "public",
      status: { $ne: "archived" },
    })
      .sort({ createdAt: -1 })
      .exec()
  }
}
