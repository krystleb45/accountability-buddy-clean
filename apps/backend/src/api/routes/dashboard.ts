import { Router } from "express"

import { getDashboardStats } from "../controllers/dashboard-controller.js"
import { protect } from "../middleware/auth-middleware.js"
import { validateSubscription } from "../middleware/subscription-validation.js"

const router = Router()

// GET /api/dashboard/stats
router.get("/stats", protect, validateSubscription, getDashboardStats)

export default router
