import { Router } from "express"
import z from "zod"

import * as MessageController from "../controllers/MessageController.js"
import { protect } from "../middleware/auth-middleware.js"
import { validateSubscription } from "../middleware/subscription-validation.js"
import validate from "../middleware/validation-middleware.js"

const router = Router()

/**
 * GET /api/messages/unread-count
 * Get unread message count for the authenticated user (all plans)
 */
router.get(
  "/unread-count",
  protect,
  validateSubscription,
  MessageController.getUnreadCount,
)

/**
 * GET /api/messages/recent
 * Get recent messages for dashboard (all plans)
 */
const recentMessageQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(5),
})

export type RecentMessageQuery = z.infer<typeof recentMessageQuerySchema>

router.get(
  "/recent",
  protect,
  validateSubscription,
  validate({ querySchema: recentMessageQuerySchema }),
  MessageController.getRecentMessages,
)

export default router
