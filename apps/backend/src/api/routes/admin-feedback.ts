import { Router } from "express"

import { protect, restrictTo } from "../middleware/auth-middleware.js"
import { Feedback } from "../models/Feedback.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

const router = Router()

router.use(protect)
router.use(restrictTo("admin"))

// GET /api/admin/feedback - Get all feedback
router.get(
  "/",
  catchAsync(async (req, res) => {
    const feedback = await Feedback.find().sort({ createdAt: -1 })
    sendResponse(res, 200, true, "Feedback retrieved successfully", {
      feedback,
    })
  })
)

export default router