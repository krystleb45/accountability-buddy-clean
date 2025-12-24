import { Router } from "express"
import mongoose from "mongoose"
import z from "zod"

import { protect } from "../middleware/auth-middleware.js"
import validate from "../middleware/validation-middleware.js"
import { User } from "../models/User.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

const router = Router()

router.use(protect)

/**
 * POST /api/block/:userId
 * Block a user
 */
router.post(
  "/:userId",
  validate({
    paramsSchema: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
  }),
  catchAsync(async (req, res) => {
    const currentUserId = req.user.id
    const userToBlockId = req.params.userId

    // Can't block yourself
    if (currentUserId === userToBlockId) {
      return sendResponse(res, 400, false, "You cannot block yourself")
    }

    // Check if user exists
    const userToBlock = await User.findById(userToBlockId)
    if (!userToBlock) {
      return sendResponse(res, 404, false, "User not found")
    }

    // Add to blocked list (if not already blocked)
    const currentUser = await User.findById(currentUserId)
    if (!currentUser) {
      return sendResponse(res, 404, false, "Current user not found")
    }

    const alreadyBlocked = currentUser.blockedUsers?.some(
      (id) => id.toString() === userToBlockId
    )

    if (alreadyBlocked) {
      return sendResponse(res, 400, false, "User is already blocked")
    }

    // Add to blocked list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: new mongoose.Types.ObjectId(userToBlockId) },
    })

    // Also remove from friends if they were friends
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: new mongoose.Types.ObjectId(userToBlockId) },
    })
    await User.findByIdAndUpdate(userToBlockId, {
      $pull: { friends: new mongoose.Types.ObjectId(currentUserId) },
    })

    sendResponse(res, 200, true, "User blocked successfully")
  })
)

/**
 * DELETE /api/block/:userId
 * Unblock a user
 */
router.delete(
  "/:userId",
  validate({
    paramsSchema: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
  }),
  catchAsync(async (req, res) => {
    const currentUserId = req.user.id
    const userToUnblockId = req.params.userId

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: new mongoose.Types.ObjectId(userToUnblockId) },
    })

    sendResponse(res, 200, true, "User unblocked successfully")
  })
)

/**
 * GET /api/block
 * Get list of blocked users
 */
router.get(
  "/",
  catchAsync(async (req, res) => {
    const currentUserId = req.user.id

    const user = await User.findById(currentUserId)
      .populate("blockedUsers", "username profileImage name")
      .select("blockedUsers")

    sendResponse(res, 200, true, "Blocked users retrieved", {
      blockedUsers: user?.blockedUsers || [],
    })
  })
)

/**
 * GET /api/block/check/:userId
 * Check if a user is blocked
 */
router.get(
  "/check/:userId",
  validate({
    paramsSchema: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
  }),
  catchAsync(async (req, res) => {
    const currentUserId = req.user.id
    const targetUserId = req.params.userId

    const currentUser = await User.findById(currentUserId)
    const isBlocked = currentUser?.blockedUsers?.some(
      (id) => id.toString() === targetUserId
    )

    sendResponse(res, 200, true, "Block status retrieved", { isBlocked })
  })
)

export default router