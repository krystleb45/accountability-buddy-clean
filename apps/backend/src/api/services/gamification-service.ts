import type { BADGE_CONDITIONS } from "@ab/shared/badge-conditions"
import type { LevelDocument, PopulatedDocument } from "src/types/mongoose.gen"

import mongoose from "mongoose"

import { BadgeType } from "../models/BadgeType"
import { Goal } from "../models/Goal"
import { Level } from "../models/Level"
import BadgeService from "./badge-service"
import { FileUploadService } from "./file-upload-service"
import { StreakService } from "./streak-service"
/**
 * Business‐logic for gamification: leaderboard, per‐user progress, points, etc.
 */
const GamificationService = {
  /**
   * Fetch a paginated leaderboard with populated user info.
   */
  async getLeaderboard(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [rawDocs, totalUsers] = await Promise.all([
      Level.find({ role: { $ne: "admin" } })
        .sort({ level: -1, points: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage"),
      Level.countDocuments({ role: { $ne: "admin" } }),
    ])

    const entries = []

    for await (const doc of rawDocs as PopulatedDocument<
      LevelDocument,
      "user"
    >[]) {
      entries.push({
        _id: doc._id.toString(),
        level: doc.level,
        points: doc.points,
        user: {
          _id: doc.user._id.toString(),
          username: doc.user.username,
          profileImage: doc.user.profileImage
            ? await FileUploadService.generateSignedUrl(doc.user.profileImage)
            : null,
        },
      })
    }

    return {
      entries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
    }
  },

  /**
   * Get or initialize a user's own gamification progress.
   */
  async getUserProgress(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID")
    }

    let profile = await Level.findOne({ user: userId })

    // If missing, create it
    if (!profile) {
      profile = await Level.create({ user: userId, level: 1, points: 0 })
    }

    return {
      level: profile.level,
      points: profile.points,
      pointsToNextLevel: profile.nextLevelAt - profile.points,
    }
  },

  /**
   * Add points to a user's gamification profile (create if missing).
   */
  async addPoints(userId: string, amount: number): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID")
    }

    let profile = await Level.findOne({ user: userId })
    if (!profile) {
      profile = await Level.create({ user: userId, level: 1, points: 0 })
    }

    await profile.addPoints(amount)

    await GamificationService.checkAndAwardBadges(userId, "point_earner")
  },

  /**
   * Check if any badges should be awarded to the user.
   * @param userId The ID of the user to check.
   * @param type The type of badge condition to check (e.g., "goal_completed").
   */
  async checkAndAwardBadges(
    userId: string,
    type: (typeof BADGE_CONDITIONS)[number],
  ) {
    switch (type) {
      case "goal_completed": {
        // Get all badge types related to goal completion
        const goalCompletedBadges = await BadgeType.find({
          conditionToMeet: "goal_completed",
        }).exec()

        if (!goalCompletedBadges.length) {
          return // No badges to check
        }

        // Get count of completed goals for this user
        const completedGoalCount = await Goal.countDocuments({
          user: userId,
          status: "completed",
        })

        // Check each badge to see if the user qualifies
        for (const badge of goalCompletedBadges) {
          // Determine which level the user qualifies for based on completed goal count
          let qualifiedLevel = null
          let nextAmountRequired = null
          let points = 0

          if (completedGoalCount >= badge.goldAmountRequired) {
            qualifiedLevel = "Gold"
            points = badge.goldPointsToAward
          } else if (completedGoalCount >= badge.silverAmountRequired) {
            qualifiedLevel = "Silver"
            nextAmountRequired = badge.goldAmountRequired
            points = badge.silverPointsToAward
          } else if (completedGoalCount >= badge.bronzeAmountRequired) {
            qualifiedLevel = "Bronze"
            nextAmountRequired = badge.silverAmountRequired
            points = badge.bronzePointsToAward
          }

          // If the user qualifies for a level, award the badge
          if (qualifiedLevel) {
            await BadgeService.awardBadge(
              userId,
              badge._id,
              qualifiedLevel,
              points,
            )
          }

          // Always update the progress of the badge
          await BadgeService.updateProgress(
            userId,
            badge._id,
            Math.min(
              (completedGoalCount / (nextAmountRequired || 1)) * 100,
              100,
            ),
          )
        }
        break
      }

      case "consistency_master": {
        // Get all badge types related to consistency mastery
        const consistencyBadges = await BadgeType.find({
          conditionToMeet: "consistency_master",
        }).exec()

        if (!consistencyBadges.length) {
          return // No badges to check
        }

        // Get login streak from streak model
        const loginStreak = await StreakService.getUserStreak(userId)

        // Check each badge to see if the user qualifies
        for (const badge of consistencyBadges) {
          // Determine which level the user qualifies for based on login streak
          let qualifiedLevel = null
          let nextAmountRequired = null
          let points = 0

          if (loginStreak.longestStreak >= badge.goldAmountRequired) {
            qualifiedLevel = "Gold"
            points = badge.goldPointsToAward
          } else if (loginStreak.longestStreak >= badge.silverAmountRequired) {
            qualifiedLevel = "Silver"
            nextAmountRequired = badge.goldAmountRequired
            points = badge.silverPointsToAward
          } else if (loginStreak.longestStreak >= badge.bronzeAmountRequired) {
            qualifiedLevel = "Bronze"
            nextAmountRequired = badge.silverAmountRequired
            points = badge.bronzePointsToAward
          }

          // If the user qualifies for a level, award the badge
          if (qualifiedLevel) {
            await BadgeService.awardBadge(
              userId,
              badge._id,
              qualifiedLevel,
              points,
            )
          }

          // Always update the progress of the badge
          await BadgeService.updateProgress(
            userId,
            badge._id,
            Math.min(
              (loginStreak.longestStreak / (nextAmountRequired || 1)) * 100,
              100,
            ),
          )
        }
        break
      }

      case "point_earner": {
        // Get all badge types related to point earning
        const pointEarnerBadges = await BadgeType.find({
          conditionToMeet: "point_earner",
        }).exec()

        if (!pointEarnerBadges.length) {
          return // No badges to check
        }

        // Get user's current points
        const userLevel = await Level.findOne({ user: userId }).exec()
        const userPoints = userLevel ? userLevel.points : 0

        // Check each badge to see if the user qualifies
        for (const badge of pointEarnerBadges) {
          // Determine which level the user qualifies for based on points
          let qualifiedLevel = null
          let nextAmountRequired = null
          let points = 0

          if (userPoints >= badge.goldAmountRequired) {
            qualifiedLevel = "Gold"
            points = badge.goldPointsToAward
          } else if (userPoints >= badge.silverAmountRequired) {
            qualifiedLevel = "Silver"
            nextAmountRequired = badge.goldAmountRequired
            points = badge.silverPointsToAward
          } else if (userPoints >= badge.bronzeAmountRequired) {
            qualifiedLevel = "Bronze"
            nextAmountRequired = badge.silverAmountRequired
            points = badge.bronzePointsToAward
          }

          // If the user qualifies for a level, award the badge
          if (qualifiedLevel) {
            await BadgeService.awardBadge(
              userId,
              badge._id,
              qualifiedLevel,
              points,
            )
          }

          // Always update the progress of the badge
          await BadgeService.updateProgress(
            userId,
            badge._id,
            Math.min((userPoints / (nextAmountRequired || 1)) * 100, 100),
          )
        }
        break
      }

      default:
        break
    }
  },
}

export default GamificationService
