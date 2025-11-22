import type { Response } from "express"

import mongoose from "mongoose"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"

import * as StreakService from "../services/streak-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

/**
 * @desc    Get user's streak details
 * @route   GET /api/streaks
 * @access  Private
 */
export const getUserStreak = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id

    if (!mongoose.isValidObjectId(userId)) {
      sendResponse(res, 400, false, "Invalid User ID format.")
      return
    }

    try {
      const streak = await StreakService.getUserStreak(userId)
      sendResponse(res, 200, true, "User streak fetched successfully", {
        streak,
      })
    } catch (err) {
      if (err.message === "Streak not found for this user.") {
        const emptyStreak = {
          streakCount: 0,
          longestStreak: 0,
          lastCheckIn: null,
        }
        sendResponse(res, 200, true, "No streak yet, returning empty", {
          streak: emptyStreak,
        })
      } else {
        throw err
      }
    }
  },
)
