// src/api/routes/feedback.ts
import { Router } from "express"
import rateLimit from "express-rate-limit"
import { check } from "express-validator"

import feedbackController from "../controllers/FeedbackController"
import { protect } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"

const router = Router()

// 5 submissions per hour
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many feedback submissions, please try again later.",
  },
})

/**
 * POST /api/feedback
 * Submit user feedback
 */
router.post(
  "/",
  protect,
  feedbackLimiter,
  [
    check("message", "Feedback message is required")
      .notEmpty()
      .isLength({ max: 1000 }),
    check("type", "Invalid feedback type").isIn([
      "bug",
      "feature-request",
      "other",
    ]),
  ],
  handleValidationErrors,
  feedbackController.submitFeedback,
)

/**
 * GET /api/feedback
 * Get feedback submitted by the authenticated user
 */
router.get("/", protect, feedbackController.getUserFeedback)

/**
 * DELETE /api/feedback/:feedbackId
 * Delete feedback by ID
 */
router.delete(
  "/:feedbackId",
  protect,
  [
    check("feedbackId", "Invalid feedback ID")
      .matches(/^[0-9a-f]{24}$/i)
      .withMessage("Must be a 24-char hex string"),
  ],
  handleValidationErrors,
  feedbackController.deleteFeedback,
)

export default router
