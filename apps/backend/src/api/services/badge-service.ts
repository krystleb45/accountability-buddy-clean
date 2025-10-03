import type { Badge as IBadge } from "src/types/mongoose.gen"

import { Types } from "mongoose"

import type { BadgeCreateInput } from "../routes/badge"

import { logger } from "../../utils/winstonLogger"
import { Badge } from "../models/Badge"
import { BadgeType } from "../models/BadgeType"
import { User } from "../models/User"
import { FileUploadService } from "./file-upload-service"
import GamificationService from "./gamification-service"

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
    points: number = 0,
  ) {
    const uid = new Types.ObjectId(userId)
    let badge = await Badge.findOne({ user: uid, badgeType })

    if (badge) {
      if (badge.level !== level) {
        badge.level = level // upgrade level
        await badge.save()
        await GamificationService.addPoints(userId, points)
        logger.info(
          `Upgraded badge ${badgeType} to ${level} for user ${userId}`,
        )
      }
    } else {
      // first award
      badge = await Badge.create({ user: uid, badgeType, level })
      await GamificationService.addPoints(userId, points)
      logger.info(
        `Created new badge ${badgeType} (${level}) for user ${userId}`,
      )
    }

    return badge
  }

  /** Get all badges for a user */
  static async getUserBadges(userId: string) {
    const allBadges = await Badge.find({ user: userId })
      .populate("badgeType")
      .sort({ createdAt: -1 })

    const badgesWithIconUrl = []

    for (const badge of allBadges) {
      const badgeObj = badge.toObject() as typeof badge & {
        badgeType: IBadge["badgeType"] & { iconUrl?: string }
      }
      if (badgeObj.badgeType.iconKey) {
        // Generate a signed URL or public URL for the icon
        badgeObj.badgeType.iconUrl = await FileUploadService.generateSignedUrl(
          badgeObj.badgeType.iconKey,
        )
      }
      badgesWithIconUrl.push(badgeObj)
    }

    return badgesWithIconUrl
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
    progress: number,
  ) {
    const uid = new Types.ObjectId(userId)
    const badge = await Badge.findOne({ user: uid, badgeType })

    if (badge) {
      badge.progress = progress
      logger.debug(
        `Updating badge progress for ${badgeType} for user ${userId} to ${progress}`,
      )
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

  /** Get badges for a member by their username (public profile) */
  static async getBadgesByUsername(username: string) {
    const badges = await Badge.aggregate([
      {
        $lookup: {
          from: User.collection.name,
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $match: { "userDetails.username": username } },
      {
        $lookup: {
          from: BadgeType.collection.name,
          localField: "badgeType",
          foreignField: "_id",
          as: "badgeTypeDetails",
        },
      },
      { $unwind: "$badgeTypeDetails" },
      {
        $project: {
          _id: 1,
          user: 1,
          badgeType: "$badgeTypeDetails",
          level: 1,
          progress: 1,
          isShowcased: 1,
          createdAt: 1,
          updatedAt: 1,
          expiresAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ])

    // Generate signed URLs for badge icons
    for (const badge of badges) {
      if (badge.badgeType.iconKey) {
        badge.badgeType.iconUrl = await FileUploadService.generateSignedUrl(
          badge.badgeType.iconKey,
        )
      }
    }

    return badges as (IBadge & {
      badgeType: IBadge["badgeType"] & { iconUrl?: string }
    })[]
  }
}
