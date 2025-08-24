import type { Request, Response } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"

import status from "http-status"

import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"
import CollaborationService from "../services/collaboration-goal-service"
import { GoalService } from "../services/goal-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user!.id

    const user = await User.findById(userId)
    if (!user) {
      throw createError("User not found", status.NOT_FOUND)
    }

    const [goals, activeGoals] = await Promise.all([
      GoalService.getUserGoals(userId),
      GoalService.getActiveGoalCount(userId),
    ] as const)
    const totalGoals = goals.length
    const completedGoals = goals.filter((g) => g.status === "completed").length

    const collaborations = await CollaborationService.countForUser(userId)

    const goalLimit = user.getGoalLimit()
    const isInTrial = user.isInTrial()
    const daysUntilTrialEnd = user.getDaysUntilTrialEnd()
    const canCreateMore = await GoalService.canUserCreateGoal(userId)

    // Subscription info
    const subscriptionInfo = {
      tier: user.subscriptionTier,
      status: user.subscription_status,
      isInTrial,
      daysUntilTrialEnd,

      features: {
        hasUnlimitedGoals: canCreateMore.maxAllowed === -1,
        hasDMMessaging: user.hasFeatureAccess("dmMessaging"),
        hasPrivateRooms: user.hasFeatureAccess("privateRooms"),
        hasWeeklyMeetings: user.hasFeatureAccess("weeklyMeetings"),
        hasAdvancedAnalytics: user.hasFeatureAccess("analytics"),
      },

      limits: {
        goalLimit,
        currentGoals: activeGoals,
        canCreateMore,
        goalLimitReached: !canCreateMore && goalLimit !== -1,
      },
    }

    // Generate upgrade prompts
    const upgradePrompts = []

    if (isInTrial) {
      if (daysUntilTrialEnd <= 3) {
        upgradePrompts.push({
          type: "trial_ending",
          message: `Your trial ends in ${daysUntilTrialEnd} days. Choose a plan to continue!`,
          action: "upgrade",
          priority: "high",
        })
      } else if (daysUntilTrialEnd <= 7) {
        upgradePrompts.push({
          type: "trial_reminder",
          message: `${daysUntilTrialEnd} days left in your trial. Don't lose access to your goals!`,
          action: "upgrade",
          priority: "medium",
        })
      }
    } else if (user.subscriptionTier === "basic" && activeGoals >= 2) {
      upgradePrompts.push({
        type: "goal_limit",
        message: `You're using ${activeGoals}/3 goal slots. Upgrade for unlimited goals!`,
        action: "upgrade",
        priority: "medium",
      })
    }

    const responseData = {
      totalGoals,
      completedGoals,
      collaborations,

      activeGoals,
      subscription: subscriptionInfo,
      upgradePrompts,

      completionRate:
        totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
    }

    sendResponse(res, 200, true, "Stats fetched", responseData)
  },
)
