// src/api/controllers/RedemptionController.ts
import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/AuthenticatedRequest"

import RedemptionService from "../services/RedemptionService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

/**
 * @desc    Redeem an item for the authenticated user
 * @route   POST /api/redemptions
 * @access  Private
 */
export const createRedemption = catchAsync(
  async (
    req: AuthenticatedRequest<
      unknown,
      unknown,
      { item: string; pointsUsed: number }
    >,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user!.id
    const { item, pointsUsed } = req.body

    const redemption = await RedemptionService.redeemForUser(
      userId,
      item,
      pointsUsed,
    )

    sendResponse(res, 201, true, "Redemption recorded", { redemption })
  },
)

/**
 * @desc    Get all redemptions for the authenticated user
 * @route   GET /api/redemptions
 * @access  Private
 */
export const getMyRedemptions = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id
    const redemptions = await RedemptionService.listByUser(userId)
    sendResponse(res, 200, true, "Redemptions fetched", { redemptions })
  },
)

/**
 * @desc    Get redemptions within a date range (admin)
 * @route   GET /api/redemptions/range
 * @access  Private/Admin
 */
export const getRedemptionsByDate = catchAsync(
  async (
    req: AuthenticatedRequest<
      unknown,
      unknown,
      unknown,
      { start: string; end: string }
    >,
    res: Response,
  ): Promise<void> => {
    const { start, end } = req.query
    const startDate = new Date(start)
    const endDate = new Date(end)

    const redemptions = await RedemptionService.listByDateRange(
      startDate,
      endDate,
    )
    sendResponse(res, 200, true, "Redemptions in range fetched", {
      redemptions,
    })
  },
)
