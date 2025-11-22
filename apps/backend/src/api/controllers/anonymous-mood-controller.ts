import type { Request, Response } from "express"

import { formatISO, sub } from "date-fns"

import type {
  MoodCheckInBody,
  MoodTrendQuery,
} from "../routes/anonymous-military-chat-routes"

import AnonymousMoodService from "../services/anonymous-mood-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

type AnonymousRequest<P = any, B = any, Q = any> = Request<P, any, B, Q> & {
  anonymousUser?: {
    sessionId: string
    displayName: string
    room: string
    joinedAt: Date
  }
}

/**
 * @desc    Submit a mood check-in
 * @route   POST /api/anonymous-military-chat/mood-checkin
 * @access  Anonymous (with session)
 */
export const submitMoodCheckIn = catchAsync(
  async (req: AnonymousRequest<unknown, MoodCheckInBody>, res: Response) => {
    const { mood, note } = req.body
    const { anonymousUser } = req

    // Get client information for analytics (optional)
    const ipAddress = req.ip || req.socket.remoteAddress
    const userAgent = req.get("User-Agent")

    const result = await AnonymousMoodService.submitMoodCheckIn(
      anonymousUser.sessionId,
      mood,
      note,
      ipAddress,
      userAgent,
    )

    sendResponse(res, 201, true, "Mood check-in submitted successfully", {
      checkInId: result.checkInId,
      mood: result.mood,
      encouragementMessage: result.encouragementMessage,
      isFirstTimeToday: result.isFirstTimeToday,
    })
  },
)

/**
 * @desc    Get community mood data for today
 * @route   GET /api/anonymous-military-chat/mood-trends/community
 * @access  Public
 */
export const getCommunityMoodData = catchAsync(
  async (_req: Request, res: Response) => {
    const communityData = await AnonymousMoodService.getCommunityMoodData()

    sendResponse(res, 200, true, "Community mood data retrieved", communityData)
  },
)

/**
 * @desc    Get mood trends over time
 * @route   GET /api/anonymous-military-chat/mood-trends/history?days=7
 * @access  Public
 */
export const getMoodTrends = catchAsync(
  async (
    req: Request<unknown, unknown, unknown, MoodTrendQuery>,
    res: Response,
  ) => {
    const days = req.query.days

    const trends = await AnonymousMoodService.getMoodTrends(days)

    sendResponse(res, 200, true, "Mood trends retrieved", {
      trends,
      days,
      startDate: formatISO(sub(new Date(), { days }), {
        representation: "date",
      }),
      endDate: formatISO(new Date(), { representation: "date" }),
    })
  },
)

/**
 * @desc    Check if session has submitted mood today
 * @route   GET `/api/anonymous-military-chat/mood-checkin/today`
 * @access  Anonymous (with session)
 */
export const hasSubmittedToday = catchAsync(
  async (req: AnonymousRequest, res: Response) => {
    const { anonymousUser } = req

    const hasSubmitted = await AnonymousMoodService.hasSubmittedToday(
      anonymousUser.sessionId,
    )

    sendResponse(res, 200, true, "Daily submission status retrieved", {
      hasSubmitted,
      sessionId: anonymousUser.sessionId,
    })
  },
)
