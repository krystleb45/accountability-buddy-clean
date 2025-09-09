import { Router } from "express"
import rateLimit from "express-rate-limit"
import { isMongoId } from "validator"
import z from "zod"

import {
  createActivity,
  deleteActivity,
  getActivityById,
  getUserActivities,
  joinActivity,
  leaveActivity,
  logActivity,
  updateActivity,
} from "../controllers/activity-controller"
import { protect } from "../middleware/auth-middleware"
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
 * GET /api/activities/:activityId
 * Fetch a single activity
 */
router.get(
  "/:activityId",
  protect,
  validate({
    paramsSchema: z.object({
      activityId: z.string().refine((value) => isMongoId(value)),
    }),
  }),
  getActivityById,
)

/**
 * PUT /api/activities/:activityId
 * Update an existing activity
 */
router.put(
  "/:activityId",
  protect,
  limiter,
  validate({
    paramsSchema: z.object({
      activityId: z.string().refine((value) => isMongoId(value)),
    }),
    bodySchema: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }),
  }),
  updateActivity,
)

/**
 * DELETE /api/activities/:activityId
 * Soft-delete an activity
 */
router.delete(
  "/:activityId",
  protect,
  validate({
    paramsSchema: z.object({
      activityId: z.string().refine((value) => isMongoId(value)),
    }),
  }),
  deleteActivity,
)

/**
 * POST /api/activities/:activityId/join
 * Join an activity
 */
router.post(
  "/:activityId/join",
  protect,
  validate({
    paramsSchema: z.object({
      activityId: z.string().refine((value) => isMongoId(value)),
    }),
  }),
  joinActivity,
)

/**
 * POST /api/activities/:activityId/leave
 * Leave an activity
 */
router.post(
  "/:activityId/leave",
  protect,
  validate({
    paramsSchema: z.object({
      activityId: z.string().refine((value) => isMongoId(value)),
    }),
  }),
  leaveActivity,
)

/**
 * POST /api/activities/log
 * Legacy logging endpoint
 */
router.post(
  "/log",
  protect,
  limiter,
  validate({
    bodySchema: z.object({
      title: z.string().nonempty("Activity type is required"),
      description: z.string().optional(),
      metadata: z.object().optional(),
    }),
  }),
  logActivity,
)

export default router
