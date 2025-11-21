// src/api/services/AnalyticsService.ts
import { logger } from "../../utils/winston-logger"
import Challenge from "../models/Challenge"
import Goal from "../models/Goal"
import { User } from "../models/User" // User model to track subscription data

/** Utility to catch and log errors */
function handleError<T>(error: unknown, message: string, fallback: T): T {
  logger.error(`${message}: ${(error as Error).message}`)
  return fallback
}

/** Calculates the goal completion rate (0–100) */
async function calculateGoalCompletionRate(userId: string): Promise<number> {
  try {
    const goals = await Goal.find({ user: userId }).lean()
    if (!goals.length) return 0
    const completed = goals.filter((g) => g.status === "completed").length
    return (completed / goals.length) * 100
  } catch (err) {
    return handleError(
      err,
      `Error calculating goal completion rate for ${userId}`,
      0,
    )
  }
}

/** Calculates the challenge participation rate (0–100) */
async function calculateChallengeParticipationRate(
  userId: string,
): Promise<number> {
  try {
    const challenges = await Challenge.find({
      "participants.userId": userId,
    }).lean()
    if (!challenges.length) return 0
    const completed = challenges.filter((c) =>
      c.participants.some(
        (p) => p.user.toString() === userId && p.progress >= 100,
      ),
    ).length
    return (completed / challenges.length) * 100
  } catch (err) {
    return handleError(
      err,
      `Error calculating challenge participation rate for ${userId}`,
      0,
    )
  }
}

/** Pulls subscription info off your User document */
async function getSubscriptionData(
  userId: string,
): Promise<Record<string, any>> {
  try {
    const user = await User.findById(userId).lean()
    if (!user) throw new Error("User not found")
    return {
      subscriptionStatus: user.subscription_status,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionTier: user.subscriptionTier,
    }
  } catch (err) {
    return handleError(
      err,
      `Error fetching subscription data for ${userId}`,
      {},
    )
  }
}

/** Bundles the two above into “feature usage” */
async function trackPremiumFeatureUsage(
  userId: string,
): Promise<Record<string, any>> {
  try {
    const [goalCompletionRate, challengeParticipationRate] = await Promise.all([
      calculateGoalCompletionRate(userId),
      calculateChallengeParticipationRate(userId),
    ])
    return { goalCompletionRate, challengeParticipationRate }
  } catch (err) {
    return handleError(err, `Error tracking premium features for ${userId}`, {})
  }
}

/**
 * Fetches all analytics for a single user.
 * The unused `_endDate` and `_metric` are left here for future custom logic.
 */
async function getUserAnalytics(
  userId: string,
  _endDate?: string,
  _metric?: string,
): Promise<Record<string, any> | null> {
  try {
    const [subscriptionData, featureUsage] = await Promise.all([
      getSubscriptionData(userId),
      trackPremiumFeatureUsage(userId),
    ])
    return { ...subscriptionData, ...featureUsage }
  } catch (err) {
    return handleError(err, `Error fetching analytics for ${userId}`, null)
  }
}

/** Globally‐rolled up metrics */
async function getGlobalAnalytics(): Promise<Record<string, any> | null> {
  try {
    const [totalUsers, totalGoals, totalChallenges, activeSubscribers] =
      await Promise.all([
        User.countDocuments(),
        Goal.countDocuments(),
        Challenge.countDocuments(),
        User.countDocuments({ subscription_status: "active" }),
      ])
    return { totalUsers, totalGoals, totalChallenges, activeSubscribers }
  } catch (err) {
    return handleError(err, "Error fetching globalThis analytics", null)
  }
}

export default {
  calculateGoalCompletionRate,
  calculateChallengeParticipationRate,
  getUserAnalytics,
  getGlobalAnalytics,
  trackPremiumFeatureUsage,
}
