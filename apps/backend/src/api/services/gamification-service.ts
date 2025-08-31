import type { LevelDocument, PopulatedDocument } from "src/types/mongoose.gen"

import mongoose from "mongoose"

import { Level } from "../models/Level"

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
      Level.find()
        .sort({ level: -1, points: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username profilePicture"),
      Level.countDocuments(),
    ])

    const entries = (rawDocs as PopulatedDocument<LevelDocument, "user">[]).map(
      (doc) => {
        return {
          _id: doc._id.toString(),
          level: doc.level,
          points: doc.points,
          user: {
            _id: doc.user._id.toString(),
            username: doc.user.username,
            profilePicture: doc.user.profilePicture,
          },
        }
      },
    )

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
  },
}

export default GamificationService
