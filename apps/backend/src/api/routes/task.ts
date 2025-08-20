// src/api/routes/streaks.ts
import type { NextFunction, Request, Response } from "express"

import { Router } from "express"
import rateLimit from "express-rate-limit"
import { check } from "express-validator"

import {
  getStreakLeaderboard,
  getUserStreak,
  logDailyCheckIn,
} from "../controllers/StreakController"
import { protect } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"
import catchAsync from "../utils/catchAsync"

const router = Router()

// Throttle check-in requests to 5 per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
})

/**
 * GET /api/streaks
 * Get the user's current streak and check-in history
 */
router.get(
  "/",
  protect,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // call the controller wrapper inside an async function
      await getUserStreak(req, res, next)
    },
  ),
)

/**
 * POST /api/streaks/check-in
 * Log a daily check-in to increment user's streak
 */
router.post(
  "/check-in",
  protect,
  limiter,
  [check("date").optional().isISO8601().withMessage("Date must be ISO8601")],
  handleValidationErrors,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await logDailyCheckIn(req, res, next)
    },
  ),
)

/**
 * GET /api/streaks/leaderboard
 * Get the streak leaderboard
 */
router.get(
  "/leaderboard",
  protect,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await getStreakLeaderboard(req, res, next)
    },
  ),
)

export default router
