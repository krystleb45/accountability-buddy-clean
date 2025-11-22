import { Router } from "express"
import rateLimit from "express-rate-limit"
import z from "zod"

import gamificationController from "../controllers/gamification-controller"
import { protect } from "../middleware/auth-middleware"
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

export default router
