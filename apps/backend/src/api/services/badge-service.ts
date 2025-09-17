import type { Badge as IBadge } from "src/types/mongoose.gen"

import mongoose, { Types } from "mongoose"

import type { BadgeCreateInput } from "../routes/badge"

import { logger } from "../../utils/winstonLogger"
import { Badge } from "../models/Badge"
import { BadgeType } from "../models/BadgeType"
import { FileUploadService } from "./file-upload-service"
import { awardPoints } from "./rewardService"

export default class BadgeService {
  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /** Create a new badge type (admin only) */
  static async createBadgeType(badgeData: BadgeCreateInput) {
    const badge = new BadgeType(badgeData)
    await badge.save()
    logger.info(`🎖️ Created new badge type: ${badgeData.name}`)
    return badge
  }

  /** Get all badge types (admin only) */
  static async getAllBadgeTypes() {
    const allBadges = await BadgeType.find().sort({ createdAt: -1 })

    const allBadgesWithIconUrl = []

    for (const badge of allBadges) {
      const badgeObj = badge.toObject() as typeof badge & { iconUrl?: string }
      if (badge.iconKey) {
        // Generate a signed URL or public URL for the icon
        badgeObj.iconUrl = await FileUploadService.generateSignedUrl(
          badge.iconKey,
        )
      }
      allBadgesWithIconUrl.push(badgeObj)
    }

    return allBadgesWithIconUrl
  }

  /** Upload or update a badge icon (admin only) */
  static async uploadBadgeIcon(badgeId: string, key: string) {
    const badge = await BadgeType.findById(badgeId)
    if (!badge) {
      throw new Error("Badge not found")
    }

    badge.iconKey = key
    await badge.save()
    logger.info(`📸 Updated badge icon for ${badgeId}`)
  }

  /** Get badge type by ID (admin only) */
  static async getBadgeById(badgeId: string) {
    const badge = await BadgeType.findById(badgeId)
    if (!badge) {
      throw new Error("Badge not found")
    }

    const badgeObj = badge.toObject() as typeof badge & { iconUrl?: string }
    if (badge.iconKey) {
      badgeObj.iconUrl = await FileUploadService.generateSignedUrl(
        badge.iconKey,
      )
    }

    return badgeObj
  }

  /** Update a badge by ID (admin only) */
  static async updateBadgeById(
    badgeId: string,
    updateData: Partial<BadgeCreateInput>,
  ) {
    return await BadgeType.findByIdAndUpdate(badgeId, updateData, {
      new: true,
    })
  }

  /** Delete a badge type by ID (admin only) */
  static async deleteBadgeById(badgeId: string) {
    return await BadgeType.findByIdAndDelete(badgeId)
  }

  /** Award or upgrade a single badge */
  static async awardBadge(
    userId: string,
    badgeType: IBadge["badgeType"],
    level: IBadge["level"] = "Bronze",
  ) {
    const uid = new Types.ObjectId(userId)
    let badge = await Badge.findOne({ user: uid, badgeType })

    if (badge) {
      // upgrade level if possible
      const nextLevel = Badge.getNextLevel(badge.level)
      if (nextLevel !== badge.level) {
        badge.level = nextLevel
        await badge.save()
        logger.info(
          `Upgraded badge ${badgeType} to ${nextLevel} for user ${userId}`,
        )
      }
    } else {
      // first award
      badge = await Badge.create({ user: uid, badgeType, level })
      logger.info(
        `Created new badge ${badgeType} (${level}) for user ${userId}`,
      )
    }

    // award points via your rewardService
    const points = Badge.awardPointsForBadge(badgeType)
    await awardPoints(userId, points)

    return badge
  }

  /** Bulk-award or upsert a badge to many users */
  static async batchAward(
    userIds: string[],
    badgeType: IBadge["badgeType"],
    level: IBadge["level"] = "Bronze",
  ) {
    const validIds = userIds.filter((id) => mongoose.isValidObjectId(id))
    if (!validIds.length) {
      throw new Error("No valid user IDs provided")
    }

    // upsert badges
    const ops = validIds.map((id) => ({
      updateOne: {
        filter: { user: new Types.ObjectId(id), badgeType },
        update: {
          $setOnInsert: { user: new Types.ObjectId(id), badgeType, level },
          $set: { badgeType, level },
        },
        upsert: true,
      },
    }))
    await Badge.bulkWrite(ops)

    // award points to each
    const points = Badge.awardPointsForBadge(badgeType)
    await Promise.all(validIds.map((id) => awardPoints(id, points)))

    return validIds
  }

  /** Get all badges for a user */
  static async getUserBadges(userId: string) {
    return Badge.find({ user: userId }).sort({ createdAt: -1 })
  }

  /** Get only showcased badges */
  static async getShowcase(userId: string) {
    return Badge.find({ user: userId, isShowcased: true }).sort({
      createdAt: -1,
    })
  }

  /** Update progress on a badge—stored separately in BadgeProgress */
  static async updateProgress(
    userId: string,
    badgeType: IBadge["badgeType"],
    increment: number,
  ) {
    const uid = new Types.ObjectId(userId)
    let badge = await Badge.findOne({ user: uid, badgeType })
    if (!badge) {
      badge = new Badge({ user: uid, badgeType, progress: increment })
    } else {
      badge.progress += increment
    }
    await badge.save()
    return badge
  }

  /** Remove expired badges (flag `isExpired`) */
  static async removeExpired(userId: string) {
    const result = await Badge.deleteMany({
      user: userId,
      expiresAt: { $lt: new Date() },
    })
    return result.deletedCount ?? 0
  }
}
