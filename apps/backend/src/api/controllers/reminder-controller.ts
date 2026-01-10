import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"

import { createError } from "../middleware/errorHandler.js"
import { ReminderService } from "../services/reminder-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export const createReminder = catchAsync(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user.id
    const { message, goalId, remindAt, recurrence, reminderType, endRepeat } = req.body

    const reminder = await ReminderService.createReminder(userId, {
      message,
      goal: goalId,
      remindAt: new Date(remindAt),
      recurrence: recurrence || "none",
      reminderType: reminderType || "email",
      endRepeat: endRepeat ? new Date(endRepeat) : undefined,
    })

    sendResponse(res, 201, true, "Reminder created successfully", { reminder })
  }
)

export const getUserReminders = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id
    const includeInactive = req.query.includeInactive === "true"

    const reminders = await ReminderService.getUserReminders(userId, includeInactive)

    sendResponse(res, 200, true, "Reminders retrieved successfully", { reminders })
  }
)

export const getReminderById = catchAsync(
  async (
    req: AuthenticatedRequest<{ reminderId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user.id
    const { reminderId } = req.params

    const reminder = await ReminderService.getReminderById(userId, reminderId)

    if (!reminder) {
      return next(createError("Reminder not found", 404))
    }

    sendResponse(res, 200, true, "Reminder retrieved successfully", { reminder })
  }
)

export const updateReminder = catchAsync(
  async (
    req: AuthenticatedRequest<{ reminderId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user.id
    const { reminderId } = req.params
    const updates = req.body

    const reminder = await ReminderService.updateReminder(userId, reminderId, updates)

    sendResponse(res, 200, true, "Reminder updated successfully", { reminder })
  }
)

export const deleteReminder = catchAsync(
  async (
    req: AuthenticatedRequest<{ reminderId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user.id
    const { reminderId } = req.params

    const deleted = await ReminderService.deleteReminder(userId, reminderId)

    if (!deleted) {
      return next(createError("Reminder not found", 404))
    }

    sendResponse(res, 200, true, "Reminder deleted successfully")
  }
)