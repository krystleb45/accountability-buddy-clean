import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

// /** GET /api/subscription/plans */
// export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
//   try {
//     const resp = await http.get<SubscriptionPlan[]>("/api/subscription/plans")
//     return resp.data
//   } catch (err) {
//     logError("fetchSubscriptionPlans", err)
//     // Return default plans if API fails
//     return getDefaultPlans()
//   }
// }

// /** POST /api/subscription/create-session */
// export async function createSubscriptionSession(
//   planId: string,
//   billingCycle: "monthly" | "yearly" = "monthly",
// ): Promise<{ sessionUrl: string; sessionId: string } | null> {
//   try {
//     const resp = await http.post<{ sessionUrl: string; sessionId: string }>(
//       "/api/subscription/create-session",
//       {
//         planId,
//         billingCycle,
//         successUrl: `${window.location.origin}/subscription/success`,
//         cancelUrl: `${window.location.origin}/subscription`,
//       },
//     )
//     return resp.data
//   } catch (err) {
//     logError("createSubscriptionSession", err)
//     return null
//   }
// }

// /** GET /api/subscription/status */
// export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
//   try {
//     const resp = await http.get<SubscriptionStatus>("/api/subscription/status")
//     return resp.data
//   } catch (err) {
//     logError("getSubscriptionStatus", err)
//     return null
//   }
// }

// /** POST /api/subscription/cancel */
// export async function cancelSubscription(): Promise<{
//   message: string
// } | null> {
//   try {
//     const resp = await http.post<{ message: string }>(
//       "/api/subscription/cancel",
//     )
//     return resp.data
//   } catch (err) {
//     logError("cancelSubscription", err)
//     return null
//   }
// }

export interface UserLimits {
  hasUnlimitedGoals: boolean
  maxGoals: number
  hasStreakTracker: boolean
  hasDMMessaging: boolean
  hasPrivateRooms: boolean
  hasWeeklyMeetings: boolean
  currentGoalCount: number
  canCreateMore: boolean
  isInTrial: boolean
  daysUntilTrialEnd: number
}

/** GET /api/subscription/limits */
export async function getUserLimits() {
  try {
    const resp = await http.get<Envelope<{ limits: UserLimits }>>(
      "/subscription/limits",
    )
    return resp.data.data.limits
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /api/subscription/create-session */
export async function createSubscriptionSession(
  planId: Exclude<User["subscriptionTier"], "free-trial" | undefined>,
  billingCycle: "monthly" | "yearly" = "monthly",
) {
  try {
    const resp = await http.post<
      Envelope<{
        sessionUrl: string
        sessionId: string
      }>
    >("/subscription/create-session", {
      planId,
      billingCycle,
      successUrl: `${window.location.origin}/subscription/success`,
      cancelUrl: `${window.location.origin}/subscription`,
    })
    return resp.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

// /** POST /api/subscription/change-plan */
// export async function changeSubscriptionPlan(
//   newPlanId: string,
//   billingCycle: "monthly" | "yearly" = "monthly",
// ): Promise<{ message: string } | null> {
//   try {
//     const resp = await http.post<{ message: string }>(
//       "/api/subscription/change-plan",
//       {
//         newPlanId,
//         billingCycle,
//       },
//     )
//     return resp.data
//   } catch (err) {
//     logError("changeSubscriptionPlan", err)
//     return null
//   }
// }

// // Utility functions
// export function canUserPerformAction(
//   userPlan: string,
//   action: keyof UserLimits,
// ): boolean {
//   const limits = PLAN_LIMITS[userPlan]
//   if (!limits) {
//     return false
//   }

//   return limits[action] === true || limits[action] === -1
// }

// export function hasReachedGoalLimit(
//   userPlan: string,
//   currentGoalCount: number,
// ): boolean {
//   const limits = PLAN_LIMITS[userPlan]
//   if (!limits) {
//     return true
//   }

//   if (limits.maxGoals === -1) {
//     return false
//   } // unlimited
//   return currentGoalCount >= limits.maxGoals
// }

// export function getPlanFeatureList(planId: string): string[] {
//   const limits = PLAN_LIMITS[planId]
//   if (!limits) {
//     return []
//   }

//   const features: string[] = []

//   if (limits.hasUnlimitedGoals) {
//     features.push("Unlimited goals")
//   } else {
//     features.push(`Up to ${limits.maxGoals} goals`)
//   }

//   if (limits.hasStreakTracker) {
//     features.push("Streak tracker")
//   }
//   if (limits.hasDailyPrompts) {
//     features.push("Daily prompts")
//   }
//   if (limits.hasGroupChat) {
//     features.push("Group chat access")
//   }
//   if (limits.hasDMMessaging) {
//     features.push("Direct messaging")
//   }
//   if (limits.hasBadgeSystem) {
//     features.push("Badge system & XP")
//   }
//   if (limits.hasAdvancedAnalytics) {
//     features.push("Advanced analytics")
//   }
//   if (limits.hasPrivateRooms) {
//     features.push("Private chatrooms")
//   }
//   if (limits.hasWeeklyMeetings) {
//     features.push("Weekly accountability meetings")
//   }
//   if (limits.hasPrioritySupport) {
//     features.push("Priority support")
//   }
//   if (limits.hasEarlyAccess) {
//     features.push("Early feature access")
//   }
//   if (limits.hasLeaderboardPerks) {
//     features.push("Leaderboard perks")
//   }
//   if (limits.hasCoachMatching) {
//     features.push("Coach matching")
//   }

//   return features
// }

// // Default plans configuration
// function getDefaultPlans(): SubscriptionPlan[] {
//   return [
//     {
//       id: "free-trial",
//       name: "Free Trial",
//       price: 0,
//       currency: "USD",
//       description: "Full access to get you started",
//       interval: "month",
//       features: getPlanFeatureList("free-trial"),
//       trialDays: 14,
//       isPopular: false,
//     },
//     {
//       id: "basic",
//       name: "Basic",
//       price: 5,
//       yearlyPrice: 50,
//       currency: "USD",
//       description: "Perfect for beginners",
//       interval: "month",
//       features: getPlanFeatureList("basic"),
//       maxGoals: 3,
//       isPopular: false,
//     },
//     {
//       id: "pro",
//       name: "Pro",
//       price: 15,
//       yearlyPrice: 150,
//       currency: "USD",
//       description: "Most popular choice",
//       interval: "month",
//       features: getPlanFeatureList("pro"),
//       maxGoals: -1,
//       isPopular: true,
//     },
//     {
//       id: "elite",
//       name: "Elite",
//       price: 30,
//       yearlyPrice: 300,
//       currency: "USD",
//       description: "For serious achievers",
//       interval: "month",
//       features: getPlanFeatureList("elite"),
//       maxGoals: -1,
//       isPopular: false,
//     },
//   ]
// }

export default {
  // fetchSubscriptionPlans,
  // createSubscriptionSession,
  // getSubscriptionStatus,
  // cancelSubscription,
  // changeSubscriptionPlan,
  getUserLimits,
  // canUserPerformAction,
  // hasReachedGoalLimit,
  // getPlanFeatureList,
  // PLAN_LIMITS,
}
