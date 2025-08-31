import type { NextFunction, Request, Response } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"

import GamificationService from "../services/gamification-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export default {
  /**
   * @desc    Get paginated leaderboard
   * @route   GET /api/gamification/leaderboard
   * @access  Private
   */
  getLeaderboard: catchAsync(
    async (
      req: AuthenticatedRequest<
        unknown,
        unknown,
        unknown,
        { page: number; limit: number }
      >,
      res: Response,
      _next: NextFunction,
    ) => {
      const { page, limit } = req.query

      // delegate to service
      const { entries, pagination } = await GamificationService.getLeaderboard(
        page,
        limit,
      )

      sendResponse(res, 200, true, "Leaderboard retrieved successfully", {
        entries,
        pagination,
      })
    },
  ),

  /**
   * @desc    Add points to a user's gamification profile
   * @route   POST /api/gamification/add-points
   * @access  Private
   */
  addPoints: catchAsync(
    async (
      req: Request<unknown, unknown, { userId: string; points: number }>,
      res: Response,
      _next: NextFunction,
    ): Promise<void> => {
      const { userId, points } = req.body

      // delegate to service
      const profile = await GamificationService.addPoints(userId, points)

      sendResponse(res, 200, true, `Added ${points} points to user ${userId}`, {
        profile,
      })
    },
  ),
}
