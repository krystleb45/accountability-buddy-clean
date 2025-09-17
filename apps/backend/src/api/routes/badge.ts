import { Router } from "express"
import rateLimit from "express-rate-limit"
import { check } from "express-validator"
import z from "zod"

import { BadgeController } from "../controllers/badge-controller"
import { protect, restrictTo } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"
import validate from "../middleware/validation-middleware"
import { BADGE_CONDITIONS } from "../models/BadgeType"
import { FileUploadService } from "../services/file-upload-service"

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

// GET /api/badges/showcase
router.get("/showcase", protect, BadgeController.getUserBadgeShowcase)

// POST /api/badges/award
router.post(
  "/award",
  protect,
  restrictTo("admin"),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many requests." },
  }),
  [
    check("userId", "Valid userId is required").isMongoId(),
    check("badgeType", "badgeType is required").notEmpty(),
    check("level").optional().isIn(["Bronze", "Silver", "Gold"]),
  ],
  handleValidationErrors,
  BadgeController.awardBadge,
)

// POST /api/badges/progress/update
router.post(
  "/progress/update",
  protect,
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many requests." },
  }),
  [
    check("badgeType", "badgeType is required").notEmpty(),
    check("increment", "increment must be a positive integer").isInt({
      min: 1,
    }),
  ],
  handleValidationErrors,
  BadgeController.updateBadgeProgress,
)

// POST /api/badges/upgrade
router.post(
  "/upgrade",
  protect,
  restrictTo("admin"),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many requests." },
  }),
  [
    check("userId", "Valid userId is required").isMongoId(),
    check("badgeType", "badgeType is required").notEmpty(),
    check("level").optional().isIn(["Bronze", "Silver", "Gold"]),
  ],
  handleValidationErrors,
  BadgeController.awardBadge, // reuse awardBadge to “upgrade” level
)

// DELETE /api/badges/expired/remove
router.delete(
  "/expired/remove",
  protect,
  restrictTo("admin"),
  BadgeController.removeExpiredBadges,
)

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

export default router
