import { Router } from "express"

import { getUserStreak } from "../controllers/StreakController.js"
import { protect } from "../middleware/auth-middleware.js"

const router = Router()

/**
 * GET /api/streaks
 * Get the user's current streak and check-in history
 */
router.get("/", protect, getUserStreak)

export default router
