import { BADGE_CONDITIONS } from "@ab/shared/badge-conditions"
import { Router } from "express"
import rateLimit from "express-rate-limit"
import z from "zod"

import { BadgeController } from "../controllers/badge-controller.js"
import { protect, restrictTo } from "../middleware/auth-middleware.js"
import validate from "../middleware/validation-middleware.js"
import { FileUploadService } from "../services/file-upload-service.js"

const router = Router()

// Apply a 100‐req/15min limiter to all badge routes
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  }),
)

// GET /api/badges
router.get("/", protect, BadgeController.getUserBadges)

/**
 * POST /api/badges
 * Create a new badge (admin only)
 */
const badgeCreateSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional(),
  bronzePointsToAward: z.int().min(0).default(0),
  silverPointsToAward: z.int().min(0).default(0),
  goldPointsToAward: z.int().min(0).default(0),
  conditionToMeet: z.enum(BADGE_CONDITIONS),
  bronzeAmountRequired: z.int().min(1).default(1),
  silverAmountRequired: z.int().min(1).default(5),
  goldAmountRequired: z.int().min(1).default(10),
  expiresAt: z.coerce.date().optional(),
})

export type BadgeCreateInput = z.infer<typeof badgeCreateSchema>

router.post(
  "/",
  protect,
  restrictTo("admin"),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many requests." },
  }),
  validate({
    bodySchema: badgeCreateSchema,
  }),
  BadgeController.createBadge,
)

/**
 * GET /api/badges/all
 * Get all badges (admin only)
 */
router.get("/all", protect, restrictTo("admin"), BadgeController.getAllBadges)

/**
 * PUT /api/badges/:id/icon
 * Upload or update badge icon (admin only)
 * multipart/form-data with field name "icon"
 */
router.put(
  "/:id/icon",
  protect,
  restrictTo("admin"),
  FileUploadService.multerUpload.single("icon"),
  BadgeController.uploadBadgeIcon,
)

/**
 * GET /api/badges/:id
 * Get badge by ID (admin only)
 */
router.get("/:id", protect, restrictTo("admin"), BadgeController.getBadgeById)

/**
 * PATCH /api/badges/:id
 * Update badge by ID (admin only)
 */
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  BadgeController.updateBadgeById,
)

/**
 * DELETE /api/badges/:id
 * Delete badge by ID (admin only)
 */
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  BadgeController.deleteBadgeById,
)

/**
 * GET /api/badges/member/:username
 * Get badges for a specific member by username
 */
router.get(
  "/member/:username",
  protect,
  validate({
    paramsSchema: z.object({
      username: z.string().nonempty(),
    }),
  }),
  BadgeController.getMemberBadges,
)

export default router
