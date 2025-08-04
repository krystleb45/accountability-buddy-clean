// src/api/controllers/notificationTriggerController.ts
import type { Request, Response } from "express"

import NotificationTriggerService from "../services/NotificationTriggerService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export const dailyStreakReminder = catchAsync(
  async (req: Request<unknown, unknown, { userId: string }>, res: Response) => {
    await NotificationTriggerService.dailyStreakReminder(req.body.userId)
    sendResponse(res, 200, true, "Streak reminder sent")
  },
)

export const levelUpNotification = catchAsync(
  async (
    req: Request<unknown, unknown, { userId: string; level: number }>,
    res: Response,
  ) => {
    const { userId, level } = req.body
    await NotificationTriggerService.levelUpNotification(userId, level)
    sendResponse(
      res,
      200,
      true,
      `Level-up notification sent for level ${level}`,
    )
  },
)

export const badgeUnlockNotification = catchAsync(
  async (
    req: Request<unknown, unknown, { userId: string; badgeName: string }>,
    res: Response,
  ) => {
    const { userId, badgeName } = req.body
    await NotificationTriggerService.badgeUnlockNotification(userId, badgeName)
    sendResponse(
      res,
      200,
      true,
      `Badge-unlock notification sent for ${badgeName}`,
    )
  },
)

export const customEmailNotification = catchAsync(
  async (
    req: Request<
      unknown,
      unknown,
      { email: string; subject: string; text: string }
    >,
    res: Response,
  ): Promise<void> => {
    const { email, subject, text } = req.body
    await NotificationTriggerService.customEmailNotification(
      email,
      subject,
      text,
    )
    sendResponse(res, 200, true, "Email sent successfully")
  },
)
