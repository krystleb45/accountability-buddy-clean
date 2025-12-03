import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"

import GamificationService from "../services/gamification-service.js"
import ProgressService from "../services/ProgressService.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export const getProgressDashboard = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    const [dashboardData, gamification] = await Promise.all([
      ProgressService.getDashboard(userId),
      GamificationService.getUserProgress(userId),
    ] as const)

    const combined = {
      ...dashboardData,
      ...gamification,
    }

    sendResponse(
      res,
      200,
      true,
      "Progress dashboard fetched successfully",
      combined,
    )
  },
)
