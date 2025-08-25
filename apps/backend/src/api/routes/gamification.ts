// src/api/routes/gamification.ts
import type { NextFunction, Request, Response } from "express"

import { Router } from "express"
import rateLimit from "express-rate-limit"
import { check } from "express-validator"
import z from "zod"

import gamificationController from "../controllers/gamificationController"
import { protect } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"
import validate from "../middleware/validation-middleware"

const router = Router()

// throttle to 10 requests per minute
const leaderboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
})

/**
 * GET /api/gamification/leaderboard
 * Get the leaderboard
 */
router.get(
  "/leaderboard",
  protect,
  leaderboardLimiter,
  validate({
    querySchema: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
    }),
  }),
  gamificationController.getLeaderboard,
)

// throttle to 10 requests per 15 minutes
const addPointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
})

/**
 * POST /api/gamification/add-points
 * Add points to a user's gamification profile
 */
router.post(
  "/add-points",
  protect,
  addPointsLimiter,
  [
    check("userId", "User ID is required and must be a valid Mongo ID")
      .notEmpty()
      .isMongoId(),
    check("points", "Points must be a positive integer").isInt({ min: 1 }),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await gamificationController.addPoints(req, res, next)
  },
)

export default router
