// src/api/controllers/partnerController.ts
import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/AuthenticatedRequest"

import PartnerService from "../services/PartnerService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export const notifyPartner = catchAsync(
  async (
    req: AuthenticatedRequest<
      unknown,
      unknown,
      { partnerId: string; goal: string; milestone: string }
    >,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const { partnerId, goal, milestone } = req.body
    const senderId = req.user!.id

    await PartnerService.notifyPartner(senderId, partnerId, goal, milestone)
    sendResponse(res, 200, true, "Partner notified successfully.")
  },
)

export const addPartnerNotification = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, { partnerId: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const { partnerId } = req.body
    const senderId = req.user!.id

    await PartnerService.addPartner(senderId, partnerId)
    sendResponse(res, 200, true, "Partner added and notified successfully.")
  },
)

export const getPartnerNotifications = catchAsync(
  async (
    req: AuthenticatedRequest<
      unknown,
      unknown,
      unknown,
      { page?: string; limit?: string }
    >,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user!.id
    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10))
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit || "10", 10)),
    )

    const { notifications, total } = await PartnerService.listNotifications(
      userId,
      page,
      limit,
    )

    if (notifications.length === 0) {
      sendResponse(res, 404, false, "No partner notifications found.")
      return
    }

    sendResponse(
      res,
      200,
      true,
      "Partner notifications fetched successfully.",
      {
        notifications,
        pagination: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      },
    )
  },
)

export default {
  notifyPartner,
  addPartnerNotification,
  getPartnerNotifications,
}
