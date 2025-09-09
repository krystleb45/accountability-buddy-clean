import type {
  AccountabilityPartnership as IAccountabilityPartnership,
  Goal as IGoal,
} from "src/types/mongoose.gen"

import { Types } from "mongoose"

import { createError } from "../middleware/errorHandler"
import { AccountabilityPartnership } from "../models/AccountabilityPartnership"
import { Goal } from "../models/Goal"

export interface ProgressDashboard {
  goals: Pick<
    IGoal,
    "title" | "description" | "dueDate" | "status" | "milestones" | "progress"
  >[]
  partnerships: (IAccountabilityPartnership & {
    user1: { _id: string; username: string; profileImage?: string }
    user2: { _id: string; username: string; profileImage?: string }
  })[]
}

class ProgressService {
  /**
   * Fetch dashboard data: goals + partnerships
   */
  static async getDashboard(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw createError("Invalid user ID", 400)
    }

    const [goals, partnerships] = await Promise.all([
      Goal.find({ user: userId })
        .select("title description dueDate status milestones progress")
        .sort({ createdAt: -1 })
        .lean(),

      AccountabilityPartnership.find({
        $or: [{ user1: userId }, { user2: userId }],
      })
        .populate("user1", "username profileImage")
        .populate("user2", "username profileImage")
        .select("-__v")
        .sort({ createdAt: -1 }),
    ])

    return { goals, partnerships }
  }

  /**
   * Fetch a user's goal progress summary.
   */
  static async getProgress(
    userId: string,
  ): Promise<Pick<IGoal, "title" | "dueDate" | "status" | "progress">[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw createError("Invalid user ID", 400)
    }
    return Goal.find({ user: userId })
      .select("title progress status dueDate")
      .sort({ updatedAt: -1 })
      .lean()
  }

  /**
   * Update the `progress` field of a single goal.
   */
  static async updateProgress(
    userId: string,
    goalId: string,
    newProgress: number,
  ): Promise<IGoal> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(goalId)) {
      throw createError("Invalid user or goal ID", 400)
    }
    if (newProgress < 0 || newProgress > 100) {
      throw createError("Progress must be between 0 and 100", 400)
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, user: userId },
      { progress: newProgress },
      { new: true, runValidators: true },
    )
    if (!goal) {
      throw createError("Goal not found or access denied", 404)
    }
    return goal
  }

  /**
   * Reset all goals' progress to 0 for a given user.
   */
  static async resetProgress(
    userId: string,
  ): Promise<{ modifiedCount: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw createError("Invalid user ID", 400)
    }
    const result = await Goal.updateMany({ user: userId }, { progress: 0 })
    return { modifiedCount: result.modifiedCount }
  }
}

export default ProgressService
