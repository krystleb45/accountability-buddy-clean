import mongoose from "mongoose"

import type { Streak as IStreak } from "../../types/mongoose.gen"

import { logger } from "../../utils/winstonLogger"
import { Streak } from "../models/Streak"
import GamificationService from "./gamification-service"

export interface LeaderboardResult {
  streaks: IStreak[]
  pagination: {
    totalEntries: number
    currentPage: number
    totalPages: number
  }
}

export async function getUserStreak(userId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid User ID format.")
  }

  const streak = await Streak.findOne({ user: userId }).populate("user")

  if (!streak) {
    throw new Error("Streak not found for this user.")
  }

  return streak
}

export async function logDailyCheckIn(userId: string): Promise<IStreak> {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid User ID format.")
  }

  let currentStreak = await Streak.findOne({ user: userId })

  if (!currentStreak) {
    currentStreak = await Streak.create({
      user: userId,
      lastCheckIn: new Date(),
      streakCount: 1,
    })
    GamificationService.addPoints(userId, 10)
    logger.info(`✅ New streak started for user ${userId}`)
    return currentStreak
  }

  const newStreak = await currentStreak.recordCheckIn()

  if (newStreak.streakCount > currentStreak.streakCount) {
    GamificationService.addPoints(userId, 10)
  }

  logger.info(
    `✅ Streak updated for user ${userId}: ${newStreak.streakCount} days`,
  )
  return newStreak
}

export async function resetUserStreak(userId: string): Promise<void> {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid User ID format.")
  }
  const streak = await Streak.findOne({ user: userId })
  if (!streak) {
    throw new Error("No streak found for this user.")
  }
  streak.streakCount = 0
  streak.lastCheckIn = null
  await streak.save()
  logger.info(`✅ Streak reset for user: ${userId}`)
}

export async function getStreakLeaderboard(
  limit: number,
  page: number,
): Promise<LeaderboardResult> {
  const skip = (page - 1) * limit
  const [streaks, totalEntries] = await Promise.all([
    Streak.find()
      .sort({ streakCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage")
      .lean()
      .exec(),
    Streak.countDocuments(),
  ])
  const totalPages = Math.ceil(totalEntries / limit)
  return {
    streaks,
    pagination: { totalEntries, currentPage: page, totalPages },
  }
}

export const StreakService = {
  getUserStreak,
  logDailyCheckIn,
  resetUserStreak,
  getStreakLeaderboard,
}
