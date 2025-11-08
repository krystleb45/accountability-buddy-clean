import { Router } from "express"
import { isMongoId } from "validator"
import z from "zod"

import * as friendController from "../controllers/friend-controller"
import { protect } from "../middleware/auth-middleware"
import { isVerified } from "../middleware/is-verified-middleware"
import {
  validateFeatureAccess,
  validateSubscription,
} from "../middleware/subscription-validation"
import validate from "../middleware/validation-middleware"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Manage friend requests and friend list
 */

/**
 * POST /api/friends/request
 * Send a friend request
 */
router.post(
  "/request",
  protect,
  isVerified,
  validate({
    bodySchema: z.object({
      recipientId: z.string().min(1, "Recipient ID is required"),
    }),
  }),
  friendController.sendFriendRequest,
)

/**
 * POST /api/friends/accept
 * Accept a friend request
 */
router.post(
  "/accept",
  protect,
  isVerified,
  validate({
    bodySchema: z.object({
      requestId: z
        .string()
        .min(1, "Request ID is required")
        .refine((val) => isMongoId(val), { message: "Invalid Request ID" }),
    }),
  }),
  friendController.acceptFriendRequest,
)

/**
 * POST /api/friends/decline
 * Decline a friend request
 */
router.post(
  "/decline",
  protect,
  isVerified,
  validate({
    bodySchema: z.object({
      requestId: z
        .string()
        .min(1, "Request ID is required")
        .refine((val) => isMongoId(val), { message: "Invalid Request ID" }),
    }),
  }),
  friendController.declineFriendRequest,
)

/**
 * GET /api/friends
 * Get user's friend list
 */
router.get("/", protect, friendController.getFriendsList)

/**
 * GET /api/friends/requests
 * Get all pending friend requests
 */
router.get("/requests", protect, friendController.getPendingFriendRequests)

/**
 * GET /api/friends/recommendations
 * Get AI-recommended friends for the user
 */
router.get(
  "/recommendations",
  protect,
  friendController.getAIRecommendedFriends,
)

/**
 * POST /api/friends/:friendId/message
 * Send a message to a friend
 */
router.post(
  "/:friendId/message",
  protect,
  isVerified,
  validateSubscription,
  validateFeatureAccess("dmMessaging"),
  validate({
    paramsSchema: z.object({
      friendId: z
        .string()
        .min(1, "Friend ID is required")
        .refine((val) => isMongoId(val), { message: "Invalid Friend ID" }),
    }),
    bodySchema: z.object({
      message: z.string().min(1, "Message cannot be empty"),
    }),
  }),
  friendController.sendMessageToFriend,
)

/**
 * GET /api/friends/:friendId/messages
 * Get chat messages with a friend
 */
const querySchema = z.object({
  page: z.number().min(1, "Page must be at least 1").default(1),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(50),
})

export type GetMessagesQuery = z.infer<typeof querySchema>

router.get(
  "/:friendId/messages",
  protect,
  isVerified,
  validate({
    paramsSchema: z.object({
      friendId: z
        .string()
        .min(1, "Friend ID is required")
        .refine((val) => isMongoId(val), { message: "Invalid Friend ID" }),
    }),
    querySchema,
  }),
  friendController.getMessagesWithFriend,
)

export default router
