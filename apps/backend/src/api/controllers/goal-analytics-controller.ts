import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"

import { GoalService } from "../services/goal-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

const getAdvancedAnalytics = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id

    // Fetch goal trends
    const goalTrends = await GoalService.getGoalTrends(userId)

    // Fetch category breakdown of goals
    const categoryBreakdown = await GoalService.getCategoryBreakdown(userId)

    sendResponse(res, 200, true, "Advanced analytics fetched successfully", {
      goalTrends,
      categoryBreakdown,
    })
  },
)

export const goalAnalyticsController = {
  getAdvancedAnalytics,
}
