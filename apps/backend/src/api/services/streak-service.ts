import mongoose from "mongoose"

import type { Streak as IStreak } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import { Streak } from "../models/Streak.js"
import GamificationService from "./gamification-service.js"

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
    await GamificationService.addPoints(userId, 10)
    await GamificationService.checkAndAwardBadges(userId, "consistency_master")
    logger.info(`✅ New streak started for user ${userId}`)
    return currentStreak
  }

  const newStreak = await currentStreak.recordCheckIn()

  if (newStreak.streakCount > currentStreak.streakCount) {
    await GamificationService.addPoints(userId, 10)
    await GamificationService.checkAndAwardBadges(userId, "consistency_master")
  }

  logger.info(
    `✅ Streak updated for user ${userId}: ${newStreak.streakCount} days`,
  )
  return newStreak
}

export const StreakService = {
  getUserStreak,
  logDailyCheckIn,
}
