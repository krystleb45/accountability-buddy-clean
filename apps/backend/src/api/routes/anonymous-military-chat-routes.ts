// src/api/routes/anonymousMilitaryChatRoutes.ts - UPDATED with mood routes

import { Router } from "express"
import z from "zod"

import {
  getCommunityMoodData,
  getMoodEncouragement,
  getMoodStatistics,
  getMoodTrends,
  hasSubmittedToday,
  submitMoodCheckIn,
} from "../controllers/anonymous-mood-controller"
import {
  getMessages,
  getRoomMemberCount,
  getRooms,
  joinRoom,
  leaveRoom,
  sendMessage,
} from "../controllers/anonymousMilitaryChatController"
import { anonymousAuth } from "../middleware/anonymous-auth"
import validate from "../middleware/validation-middleware"

const router = Router()

// ===== CHAT ROUTES =====

// Public chat routes - no authentication required
router.get("/rooms", getRooms)
router.get("/rooms/:roomId/messages", getMessages)
router.get("/rooms/:roomId/members", getRoomMemberCount)

// Anonymous session chat routes
router.post("/rooms/:roomId/join", anonymousAuth, joinRoom)
router.post("/rooms/:roomId/message", anonymousAuth, sendMessage)
router.post("/rooms/:roomId/leave", anonymousAuth, leaveRoom)

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
router.get("/mood-stats", getMoodStatistics)
router.get("/mood-encouragement/:mood", getMoodEncouragement)

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
