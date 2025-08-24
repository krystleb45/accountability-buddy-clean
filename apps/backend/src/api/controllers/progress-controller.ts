import type { Request, Response } from "express"

import ProgressService from "../services/ProgressService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"
// 👇 import your server-side gamification service
import GamificationService from "../services/gamification-service"

export const getProgressDashboard = catchAsync(
  async (req: Request, res: Response) => {
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

export const getProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const goals = await ProgressService.getProgress(userId)
  sendResponse(res, 200, true, "Progress fetched successfully", { goals })
})

export const updateProgress = catchAsync(
  async (
    req: Request<unknown, unknown, { goalId: string; progress: number }>,
    res: Response,
  ) => {
    const userId = req.user!.id
    const { goalId, progress } = req.body
    const updated = await ProgressService.updateProgress(
      userId,
      goalId,
      progress,
    )
    sendResponse(res, 200, true, "Progress updated successfully", {
      goal: updated,
    })
  },
)

export const resetProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const result = await ProgressService.resetProgress(userId)
  sendResponse(res, 200, true, "Progress reset successfully", result)
})
