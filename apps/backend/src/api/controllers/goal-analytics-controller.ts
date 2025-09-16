import type { Response } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"

import { GoalService } from "../services/goal-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

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
