import { Router } from "express"
import z from "zod"

import {
  getMessages,
  getRooms,
} from "../controllers/anonymous-military-chat-controller.js"
import {
  getCommunityMoodData,
  getMoodTrends,
  hasSubmittedToday,
  submitMoodCheckIn,
} from "../controllers/anonymous-mood-controller.js"
import { anonymousAuth } from "../middleware/anonymous-auth.js"
import validate from "../middleware/validation-middleware.js"

const router = Router()

// ===== CHAT ROUTES =====

// Public chat routes - no authentication required
router.get("/rooms", getRooms)
router.get(
  "/rooms/:roomId/messages",
  validate({
    paramsSchema: z.object({
      roomId: z.string().nonempty(),
    }),
    querySchema: z.object({
      limit: z.coerce.number().min(1).optional(),
    }),
  }),
  getMessages,
)

// ===== MOOD CHECK-IN ROUTES =====

// Public mood routes - no authentication required
router.get("/mood-trends/community", getCommunityMoodData)

const moodTrendQuerySchema = z.object({
  days: z.coerce.number().min(1).max(30).default(7),
})

export type MoodTrendQuery = z.infer<typeof moodTrendQuerySchema>

router.get(
  "/mood-trends/history",
  validate({
    querySchema: moodTrendQuerySchema,
  }),
  getMoodTrends,
)

// Anonymous session mood routes - require session ID
const moodCheckInBodySchema = z.object({
  mood: z.number().min(1).max(5),
  note: z.string().trim().max(500).optional(),
})

export type MoodCheckInBody = z.infer<typeof moodCheckInBodySchema>

router.post(
  "/mood-checkin",
  anonymousAuth,
  validate({
    bodySchema: moodCheckInBodySchema,
  }),
  submitMoodCheckIn,
)
router.get("/mood-checkin/today", anonymousAuth, hasSubmittedToday)

export default router
