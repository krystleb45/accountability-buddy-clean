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
} from "../controllers/ActivityController"
import { protect } from "../middleware/auth-middleware"
import validate from "../middleware/validation-middleware"

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
 * GET /api/activity
 * List user’s activities (paginated via ?page & ?limit)
 */
router.get("/", protect, getUserActivities)

/**
 * GET /api/activity/:activityId
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
 * POST /api/activity
 * Create a new activity
 */
router.post(
  "/",
  protect,
  limiter,
  validate({
    bodySchema: z.object({
      title: z.string().nonempty("Activity title is required"),
      description: z.string().optional(),
    }),
  }),
  createActivity,
)

/**
 * PUT /api/activity/:activityId
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
 * DELETE /api/activity/:activityId
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
 * POST /api/activity/:activityId/join
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
 * POST /api/activity/:activityId/leave
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
 * POST /api/activity/log
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
