import { Router } from "express"

import { getDashboardStats } from "../controllers/dashboard-controller"
import { protect } from "../middleware/auth-middleware"
import { validateSubscription } from "../middleware/subscription-validation"

const router = Router()

// GET /api/dashboard/stats
router.get("/stats", protect, validateSubscription, getDashboardStats)

export default router
