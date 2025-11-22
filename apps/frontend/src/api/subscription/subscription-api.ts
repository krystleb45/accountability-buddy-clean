import type { BillingCycle, PlanId } from "@ab/shared/pricing"

import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

/** POST /api/subscription/cancel */
export async function cancelSubscription() {
  try {
    const resp = await http.post<Envelope<{ message: string }>>(
      "/subscription/cancel",
    )
    return resp.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

interface UserLimits {
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
  hasAdvancedAnalytics: boolean
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
  billingCycle: BillingCycle = "monthly",
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
      successUrl: `${window.location.origin}/subscription`,
      cancelUrl: `${window.location.origin}/subscription`,
    })
    return resp.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /api/subscription/portal-session */
export async function createBillingPortalSession() {
  try {
    const resp = await http.post<
      Envelope<{
        sessionUrl: string
      }>
    >("/subscription/portal-session", {
      returnUrl: `${window.location.origin}/subscription`,
    })
    return resp.data.data.sessionUrl
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

// /** POST /api/subscription/change-plan */
export async function changeSubscriptionPlan(
  newPlanId: PlanId,
  billingCycle: BillingCycle = "monthly",
) {
  try {
    await http.post("/subscription/change-plan", {
      newPlanId,
      billingCycle,
    })
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
