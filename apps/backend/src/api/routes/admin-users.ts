import { Router } from "express"

import { protect, restrictTo } from "../middleware/auth-middleware.js"
import { Activity } from "../models/Activity.js"
import { Goal } from "../models/Goal.js"
import { User } from "../models/User.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

const router = Router()

router.use(protect)
router.use(restrictTo("admin"))

// GET /api/admin/users/:id - Get user details
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return sendResponse(res, 404, false, "User not found")
    }
    sendResponse(res, 200, true, "User retrieved", { user })
  })
)

// GET /api/admin/users/:id/activities - Get user's activities
router.get(
  "/:id/activities",
  catchAsync(async (req, res) => {
    const activities = await Activity.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    sendResponse(res, 200, true, "Activities retrieved", { activities })
  })
)

// GET /api/admin/users/:id/goals - Get user's goals
router.get(
  "/:id/goals",
  catchAsync(async (req, res) => {
    const goals = await Goal.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean()
    sendResponse(res, 200, true, "Goals retrieved", { goals })
  })
)

export default router