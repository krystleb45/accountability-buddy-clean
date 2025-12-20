import { Router } from "express"

import { goalAnalyticsController } from "../controllers/goal-analytics-controller.js"
import { protect } from "../middleware/auth-middleware.js"
import {
  validateFeatureAccess,
  validateSubscription,
} from "../middleware/subscription-validation.js"

const router = Router()

/**
 * GET /api/analytics/advanced
 * Advanced analytics dashboard (Pro+ plans only)
 */
router.get(
  "/advanced",
  protect,
  validateSubscription,
  validateFeatureAccess("analytics"), // Pro or higher plan required
  goalAnalyticsController.getAdvancedAnalytics,
)

export default router
