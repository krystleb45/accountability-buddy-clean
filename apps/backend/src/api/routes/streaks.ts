import { Router } from "express"

import { getUserStreak } from "../controllers/StreakController"
import { protect } from "../middleware/auth-middleware"

const router = Router()

/**
 * GET /api/streaks
 * Get the user's current streak and check-in history
 */
router.get("/", protect, getUserStreak)

export default router
