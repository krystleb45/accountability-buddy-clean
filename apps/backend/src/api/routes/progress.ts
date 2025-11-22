import { Router } from "express"

import { getProgressDashboard } from "../controllers/progress-controller"
import { protect } from "../middleware/auth-middleware"

const router = Router()

// apply protect to *all* progress routes
router.use(protect)

/**
 * GET  /api/progress/dashboard
 */
router.get("/dashboard", getProgressDashboard)

export default router
