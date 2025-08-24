import { Router } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"

import { getDashboardStats } from "../controllers/dashboard-controller"
import { protect } from "../middleware/auth-middleware"
import { createError } from "../middleware/errorHandler"
import {
  validateFeatureAccess,
  validateSubscription,
} from "../middleware/subscription-validation"
import { Goal } from "../models/Goal"
import { User } from "../models/User"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

const router = Router()

// GET /api/dashboard/stats - Enhanced with subscription data
router.get("/stats", protect, validateSubscription, getDashboardStats)

// GET /api/dashboard/overview - Comprehensive dashboard data
router.get(
  "/overview",
  protect,
  validateSubscription,
  catchAsync(async (req, res) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user!.id

    const user = await User.findById(userId)
    if (!user) {
      throw createError("User not found", 404)
    }

    // Get recent goals for dashboard display
    const recentGoals = await Goal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    const activeGoalsList = recentGoals
      .filter((goal) => ["not-started", "in-progress"].includes(goal.status))
      .map((goal) => ({
        id: goal._id.toString(),
        title: goal.title,
        progress: goal.progress,
        dueDate: goal.dueDate,
        category: goal.category,
        status: goal.status,
      }))

    // Get counts
    const [totalGoals, completedGoals, activeGoalCount] = await Promise.all([
      Goal.countDocuments({ user: userId }),
      Goal.countDocuments({ user: userId, status: "completed" }),
      Goal.countDocuments({
        user: userId,
        status: { $in: ["not-started", "in-progress"] },
      }),
    ])

    // FIXED: Use helper functions
    const goalLimit = getGoalLimitForTier(user.subscriptionTier)
    const isInTrial = isInTrialStatus(user)
    const daysUntilTrialEnd = getDaysUntilTrialEnd(user)
    const canCreateMore = canCreateMoreGoals(
      user.subscriptionTier,
      activeGoalCount,
    )

    const overviewData = {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        streak: user.streakCount || 0,
        points: user.points || 0,
      },

      subscription: {
        tier: user.subscriptionTier,
        status: user.subscription_status,
        isInTrial,
        daysUntilTrialEnd,
        trialEndDate: user.trial_end_date,
        nextBillingDate: user.next_billing_date,

        features: {
          hasUnlimitedGoals: hasFeatureAccessForTier(
            user.subscriptionTier,
            "unlimited_goals",
          ),
          hasDMMessaging: hasFeatureAccessForTier(
            user.subscriptionTier,
            "dmMessaging",
          ),
          hasPrivateRooms: hasFeatureAccessForTier(
            user.subscriptionTier,
            "privateRooms",
          ),
          hasWeeklyMeetings: hasFeatureAccessForTier(
            user.subscriptionTier,
            "weeklyMeetings",
          ),
          hasAdvancedAnalytics: hasFeatureAccessForTier(
            user.subscriptionTier,
            "analytics",
          ),
        },

        limits: {
          goalLimit,
          currentGoals: activeGoalCount,
          canCreateMore,
        },
      },

      goals: {
        total: totalGoals,
        completed: completedGoals,
        active: activeGoalCount,
        recent: activeGoalsList,
      },

      activity: {
        collaborations: 0, // Replace with actual count
        completionRate:
          totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      },
    }

    sendResponse(
      res,
      200,
      true,
      "Dashboard overview retrieved successfully",
      overviewData,
    )
  }),
)

// GET /api/dashboard/analytics - Advanced analytics (Pro+ only)
router.get(
  "/analytics",
  protect,
  validateSubscription,
  validateFeatureAccess("analytics"),
  catchAsync(async (req, res) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user!.id

    const user = await User.findById(userId)
    if (!user) {
      throw createError("User not found", 404)
    }

    // Get all goals for analytics
    const goals = await Goal.find({ user: userId }).lean()

    const analytics = {
      goalCompletion: {
        total: goals.length,
        completed: goals.filter((g) => g.status === "completed").length,
        inProgress: goals.filter((g) => g.status === "in-progress").length,
        notStarted: goals.filter((g) => g.status === "not-started").length,
      },

      streakAnalytics: {
        currentStreak: user.streakCount || 0,
        totalGoals: goals.length,
      },

      categoryBreakdown: goals.reduce(
        (acc, goal) => {
          acc[goal.category] = (acc[goal.category] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),

      monthlyProgress: goals
        .filter((g) => g.completedAt)
        .reduce(
          (acc, goal) => {
            const month = goal.completedAt!.toISOString().slice(0, 7) // YYYY-MM
            acc[month] = (acc[month] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
    }

    sendResponse(res, 200, true, "Analytics data retrieved successfully", {
      analytics,
      subscription: {
        tier: user.subscriptionTier,
        hasAdvancedAnalytics: true,
      },
    })
  }),
)

export default router
