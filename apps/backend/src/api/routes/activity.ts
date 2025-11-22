import { Router } from "express"
import rateLimit from "express-rate-limit"
import z from "zod"

import {
  createActivity,
  getAllActivities,
  getUserActivities,
} from "../controllers/activity-controller"
import { protect, restrictTo } from "../middleware/auth-middleware"
import validate from "../middleware/validation-middleware"
import { ACTIVITY_TYPES } from "../models/Activity"

const router = Router()

// Throttle mutating endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
})

/**
 * GET /api/activities
 * List user’s activities (paginated via ?page & ?limit)
 */
router.get(
  "/",
  protect,
  validate({
    querySchema: z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().min(1).default(10),
      type: z.string().optional(),
    }),
  }),
  getUserActivities,
)

/**
 * POST /api/activities
 * Create a new activity
 */
const createActivitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  description: z.string().max(500),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type CreateActivityData = z.infer<typeof createActivitySchema>

router.post(
  "/",
  protect,
  limiter,
  validate({
    bodySchema: createActivitySchema,
  }),
  createActivity,
)

/**
 * GET /api/activities/all
 * Fetch all activities (admin only)
 */
router.get("/all", protect, restrictTo("admin"), getAllActivities)

export default router
