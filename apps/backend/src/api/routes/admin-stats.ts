import { Router } from "express"

import { protect, restrictTo } from "../middleware/auth-middleware.js"
import { Feedback } from "../models/Feedback.js"
import { User } from "../models/User.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

const router = Router()

router.use(protect)
router.use(restrictTo("admin"))

// GET /api/admin/stats - Get dashboard statistics
router.get(
  "/",
  catchAsync(async (req, res) => {
    // Total users
    const totalUsers = await User.countDocuments()
    
    // Users by subscription status
    const trialUsers = await User.countDocuments({ subscription_status: "trial" })
    const activeUsers = await User.countDocuments({ subscription_status: "active" })
    const expiredUsers = await User.countDocuments({ subscription_status: "expired" })
    
    // New users this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    })
    
    // New users this month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    })
    
    // Total feedback
    const totalFeedback = await Feedback.countDocuments()
    
    // Feedback this week
    const feedbackThisWeek = await Feedback.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    })
    
    // Recent users (last 5 signups)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt subscription_status")
    
    // Recent feedback (last 5)
    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("message type createdAt userId")

    sendResponse(res, 200, true, "Admin stats retrieved successfully", {
      stats: {
        users: {
          total: totalUsers,
          trial: trialUsers,
          active: activeUsers,
          expired: expiredUsers,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
        },
        feedback: {
          total: totalFeedback,
          thisWeek: feedbackThisWeek,
        },
      },
      recentUsers,
      recentFeedback,
    })
  })
)

export default router