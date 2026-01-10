import { startOfWeek, endOfWeek, subWeeks } from "date-fns"

import type { UserDocument } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import { Activity } from "../models/Activity.js"
import { Badge } from "../models/Badge.js"
import { Goal } from "../models/Goal.js"
import { Level } from "../models/Level.js"
import { User } from "../models/User.js"
import { StreakService } from "./streak-service.js"
import { sendWeeklyDigestEmail } from "./email-service.js"

export interface WeeklyDigestData {
  username: string
  email: string
  stats: {
    totalGoals: number
    completedThisWeek: number
    inProgress: number
    currentStreak: number
    longestStreak: number
    totalXP: number
    level: number
  }
  upcomingDeadlines: Array<{
    title: string
    dueDate: Date
    progress: number
  }>
  recentBadges: Array<{
    name: string
    level: string
    dateAwarded: Date
  }>
  weeklyActivity: {
    goalsCreated: number
    progressUpdates: number
  }
}

export class DigestService {
  /**
   * Get all users who have weekly digest enabled
   */
  static async getUsersWithDigestEnabled(): Promise<UserDocument[]> {
    return User.find({
      active: true,
      isVerified: true,
      "settings.notifications.weeklyDigest": { $ne: false },
      "settings.notifications.email": { $ne: false },
    }).exec()
  }

  /**
   * Gather weekly stats for a user
   */
  static async getWeeklyDigestData(userId: string): Promise<WeeklyDigestData | null> {
    const user = await User.findById(userId)
    if (!user) return null

    const now = new Date()
    const weekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) // Last Monday
    const weekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) // Last Sunday

    // Get goals stats
    const [totalGoals, completedThisWeek, inProgressGoals] = await Promise.all([
      Goal.countDocuments({ user: userId }),
      Goal.countDocuments({
        user: userId,
        status: "completed",
        completedAt: { $gte: weekStart, $lte: weekEnd },
      }),
      Goal.countDocuments({
        user: userId,
        status: "in-progress",
      }),
    ])

    // Get streak data
    const streakData = await StreakService.getUserStreak(userId)

    // Get level/XP
    const levelData = await Level.findOne({ user: userId })

    // Get upcoming deadlines (next 7 days)
    const upcomingDeadlines = await Goal.find({
      user: userId,
      status: { $in: ["not-started", "in-progress"] },
      dueDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    })
      .select("title dueDate progress")
      .sort({ dueDate: 1 })
      .limit(5)
      .exec()

    // Get recent badges (this week)
    const recentBadges = await Badge.find({
      user: userId,
      dateAwarded: { $gte: weekStart },
    })
      .populate("badgeType", "name")
      .sort({ dateAwarded: -1 })
      .limit(3)
      .exec()

    // Get weekly activity counts
    const [goalsCreated, progressUpdates] = await Promise.all([
      Activity.countDocuments({
        user: userId,
        type: "goal",
        description: { $regex: /^Started new goal/ },
        createdAt: { $gte: weekStart, $lte: weekEnd },
      }),
      Activity.countDocuments({
        user: userId,
        type: "goal",
        description: { $regex: /progress/ },
        createdAt: { $gte: weekStart, $lte: weekEnd },
      }),
    ])

    return {
      username: user.username,
      email: user.email,
      stats: {
        totalGoals,
        completedThisWeek,
        inProgress: inProgressGoals,
        currentStreak: streakData.streakCount,
        longestStreak: streakData.longestStreak,
        totalXP: levelData?.points || 0,
        level: levelData?.level || 1,
      },
      upcomingDeadlines: upcomingDeadlines.map((g) => ({
        title: g.title,
        dueDate: g.dueDate,
        progress: g.progress,
      })),
      recentBadges: recentBadges.map((b) => ({
        name: (b.badgeType as any)?.name || "Badge",
        level: b.level,
        dateAwarded: b.dateAwarded,
      })),
      weeklyActivity: {
        goalsCreated,
        progressUpdates,
      },
    }
  }

  /**
   * Send weekly digest to all eligible users
   */
  static async sendWeeklyDigests(): Promise<number> {
    const users = await this.getUsersWithDigestEnabled()
    let sentCount = 0

    logger.info(`📧 Sending weekly digest to ${users.length} users`)

    for (const user of users) {
      try {
        const digestData = await this.getWeeklyDigestData(user._id.toString())
        
        if (digestData) {
          await sendWeeklyDigestEmail(digestData)
          sentCount++
          logger.info(`📧 Sent weekly digest to ${user.email}`)
        }
      } catch (error) {
        logger.error(`❌ Failed to send digest to ${user.email}:`, error)
      }
    }

    logger.info(`📧 Weekly digest complete: ${sentCount}/${users.length} sent`)
    return sentCount
  }
}