import { Router } from "express"

import { getProgressDashboard } from "../controllers/progress-controller.js"
import { protect } from "../middleware/auth-middleware.js"

const router = Router()

// apply protect to *all* progress routes
router.use(protect)

/**
 * GET  /api/progress/dashboard
 */
router.get("/dashboard", getProgressDashboard)

export default router
