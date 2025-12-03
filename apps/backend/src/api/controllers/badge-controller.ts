import type { Request, Response } from "express"

import sanitize from "mongo-sanitize"
import { Types } from "mongoose"

import type { AdminRequest } from "../../types/AdminRequest.js"
import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { BadgeCreateInput } from "../routes/badge.js"

import BadgeService from "../services/badge-service.js"
import { FileUploadService } from "../services/file-upload-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export class BadgeController {
  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static createBadge = catchAsync(
    async (
      req: AdminRequest<unknown, unknown, BadgeCreateInput>,
      res: Response,
    ) => {
      const badgeData = sanitize(req.body)
      const badge = await BadgeService.createBadgeType(badgeData)
      sendResponse(res, 201, true, "Badge created", { badge })
    },
  )

  public static uploadBadgeIcon = catchAsync(
    async (req: AdminRequest<{ id: string }>, res: Response) => {
      if (!req.file) {
        sendResponse(res, 400, false, "No file (icon) uploaded")
        return
      }

      const badgeId = req.params.id
      const fileNameToSave = `badge-${badgeId}-icon`
      const { key } = await FileUploadService.uploadToS3({
        buffer: req.file.buffer,
        name: fileNameToSave,
        mimetype: req.file.mimetype,
      })

      await BadgeService.uploadBadgeIcon(badgeId, key)
      sendResponse(res, 200, true, "Badge icon updated")
    },
  )

  public static getAllBadges = catchAsync(
    async (req: AdminRequest, res: Response) => {
      const badges = await BadgeService.getAllBadgeTypes()
      sendResponse(res, 200, true, "All badges", { badges })
    },
  )

  public static getBadgeById = catchAsync(
    async (req: AdminRequest<{ id: string }>, res: Response) => {
      const badgeId = req.params.id

      if (!Types.ObjectId.isValid(badgeId)) {
        sendResponse(res, 400, false, "Invalid badge ID")
        return
      }

      const badge = await BadgeService.getBadgeById(badgeId)

      if (!badge) {
        sendResponse(res, 404, false, "Badge not found")
        return
      }

      sendResponse(res, 200, true, "Badge retrieved", { badge })
    },
  )

  public static updateBadgeById = catchAsync(
    async (
      req: AdminRequest<{ id: string }, unknown, Partial<BadgeCreateInput>>,
      res: Response,
    ) => {
      const badgeId = req.params.id
      const updateData = sanitize(req.body)

      if (!Types.ObjectId.isValid(badgeId)) {
        sendResponse(res, 400, false, "Invalid badge ID")
        return
      }

      const updatedBadge = await BadgeService.updateBadgeById(
        badgeId,
        updateData,
      )

      if (!updatedBadge) {
        sendResponse(res, 404, false, "Badge not found")
        return
      }

      sendResponse(res, 200, true, "Badge updated", { badge: updatedBadge })
    },
  )

  public static deleteBadgeById = catchAsync(
    async (req: AdminRequest<{ id: string }>, res: Response) => {
      const badgeId = req.params.id

      if (!Types.ObjectId.isValid(badgeId)) {
        sendResponse(res, 400, false, "Invalid badge ID")
        return
      }

      const deleted = await BadgeService.deleteBadgeById(badgeId)

      if (!deleted) {
        sendResponse(res, 404, false, "Badge not found")
        return
      }

      if (deleted.iconKey) {
        await FileUploadService.deleteFromS3(deleted.iconKey)
      }

      sendResponse(res, 200, true, "Badge deleted")
    },
  )

  public static awardBadge = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { userId, badgeType, level } = sanitize(req.body)

      if (!Types.ObjectId.isValid(userId) || !badgeType) {
        sendResponse(res, 400, false, "userId and badgeType are required")
        return
      }

      const badge = await BadgeService.awardBadge(userId, badgeType, level)
      sendResponse(res, 201, true, "Badge awarded", { badge })
    },
  )

  public static getUserBadges = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user.id
      const badges = await BadgeService.getUserBadges(userId)
      sendResponse(res, 200, true, "User badges", { badges })
    },
  )

  public static getUserBadgeShowcase = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user.id
      const badges = await BadgeService.getShowcase(userId)
      sendResponse(res, 200, true, "Badge showcase", { badges })
    },
  )

  public static updateBadgeProgress = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const { badgeType, increment } = sanitize(req.body)
      const prog = await BadgeService.updateProgress(
        req.user.id,
        badgeType,
        Number(increment),
      )
      sendResponse(res, 200, true, "Progress updated", { progress: prog })
    },
  )

  public static removeExpiredBadges = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const removedCount = await BadgeService.removeExpired(req.user.id)
      if (removedCount) {
        sendResponse(res, 200, true, "Expired badges removed", {
          count: removedCount,
        })
      } else {
        sendResponse(res, 404, false, "No expired badges")
      }
    },
  )

  public static getMemberBadges = catchAsync(
    async (req: AuthenticatedRequest<{ username: string }>, res: Response) => {
      const { username } = req.params

      const badges = await BadgeService.getBadgesByUsername(username)
      sendResponse(res, 200, true, "Member badges", { badges })
    },
  )
}
