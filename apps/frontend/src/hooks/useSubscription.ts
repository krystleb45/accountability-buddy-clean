// src/hooks/useSubscription.ts - FIXED: Wait for NextAuth session
"use client"

import { useSession } from "next-auth/react" // ADD THIS
import { useCallback, useEffect, useRef, useState } from "react"

import type {
  BillingHistoryItem,
  SubscriptionDetails,
  UpdateSubscriptionPayload,
} from "@/types/Stripe.types"

import { useAPI } from "@/context/data/APIContext"

// ... keep all your existing interfaces exactly the same ...
export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  yearlyPrice?: number
  currency?: string
  description: string
  interval?: "month" | "year"
  features: string[]
  isPopular?: boolean
  trialDays?: number
  maxGoals?: number
  stripePriceId?: string
  stripeYearlyPriceId?: string
}

export interface SubscriptionStatus {
  isActive: boolean
  currentPlan: string
  renewalDate: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
  subscription_status:
    | "active"
    | "canceled"
    | "past_due"
    | "trialing"
    | "incomplete"
    | "trial"
    | "expired" // ← Changed from 'status'
  billingCycle?: "monthly" | "yearly"
}

export interface UserLimits {
  maxGoals: number
  hasUnlimitedGoals: boolean
  hasDMMessaging: boolean
  hasPrivateRooms: boolean
  hasWeeklyMeetings: boolean
  hasAdvancedAnalytics: boolean
  hasPrioritySupport: boolean
  hasEarlyAccess: boolean
  hasLeaderboardPerks: boolean
  hasCoachMatching: boolean
  hasGroupChat: boolean
  hasStreakTracker: boolean
  hasDailyPrompts: boolean
  hasBadgeSystem: boolean
  currentGoalCount: number
  canCreateGoal: boolean
  isInTrial: boolean
  daysUntilTrialEnd: number
}

interface UseSubscriptionReturn {
  // Legacy support
  subscription: SubscriptionDetails | null
  billingHistory: BillingHistoryItem[]
  loading: boolean
  error: string | null
  fetchSubscriptionDetails: () => Promise<void>
  fetchBillingHistory: () => Promise<void>
  updateSubscription: (payload: UpdateSubscriptionPayload) => Promise<void>
  cancelSubscription: () => Promise<void>
  clearError: () => void
  refreshAll: () => Promise<void>

  // New pricing tier functionality
  plans: SubscriptionPlan[]
  status: SubscriptionStatus | null
  limits: UserLimits | null
  fetchPlans: () => Promise<void>
  fetchStatus: () => Promise<void>
  fetchLimits: () => Promise<void>
  createCheckoutSession: (
    planId: string,
    billingCycle?: "monthly" | "yearly",
  ) => Promise<{ sessionUrl: string } | null>
  changePlan: (
    newPlanId: string,
    billingCycle?: "monthly" | "yearly",
  ) => Promise<void>

  // Convenience methods
  canCreateGoal: boolean
  hasUnlimitedGoals: boolean
  maxGoals: number
  currentGoalCount: number
  hasDMMessaging: boolean
  hasPrivateRooms: boolean
  hasWeeklyMeetings: boolean
  isInTrial: boolean
  daysUntilTrialEnd: number
}

export default function useSubscription(): UseSubscriptionReturn {
  const { callAPI } = useAPI()

  // ADD THIS: Get NextAuth session
  const { data: session, status: sessionStatus } = useSession()

  // ... keep all your existing state exactly the same ...
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null,
  )
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [limits, setLimits] = useState<UserLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subRef = useRef<(() => Promise<void>) | undefined>(undefined)
  const histRef = useRef<(() => Promise<void>) | undefined>(undefined)
  const statusRef = useRef<(() => Promise<void>) | undefined>(undefined)
  const limitsRef = useRef<(() => Promise<void>) | undefined>(undefined)

  // ... keep all your existing methods exactly the same ...
  const fetchSubscriptionDetails = useCallback(async (): Promise<void> => {
    setError(null)
    try {
      const response = await callAPI<{ subscription: SubscriptionDetails }>({
        method: "get",
        url: "/subscription/details",
      })
      setSubscription(response.subscription || (response as any))
    } catch (err) {
      console.error("Error fetching subscription details:", err)
      setError("Failed to load subscription details.")
    }
  }, [callAPI])

  const fetchBillingHistory = useCallback(async (): Promise<void> => {
    setError(null)
    try {
      const response = await callAPI<{ billingHistory: BillingHistoryItem[] }>({
        method: "get",
        url: "/subscription/billing-history",
      })
      setBillingHistory(response.billingHistory || [])
    } catch (err) {
      console.error("Error fetching billing history:", err)
      setError("Failed to load billing history.")
    }
  }, [callAPI])

  const updateSubscription = useCallback(
    async (payload: UpdateSubscriptionPayload): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        await callAPI<void>({
          method: "post",
          url: "/subscription/update",
          data: payload,
        })
        await fetchSubscriptionDetails()
      } catch (err) {
        console.error("Error updating subscription:", err)
        setError("Failed to update subscription.")
      } finally {
        setLoading(false)
      }
    },
    [callAPI, fetchSubscriptionDetails],
  )

  const fetchStatus = useCallback(async (): Promise<void> => {
    setError(null)
    try {
      console.log("📡 Fetching status...")
      const response = await callAPI<{ status: SubscriptionStatus }>({
        method: "get",
        url: "/subscription/status",
      })

      console.log("📡 Status API response:", response)
      const statusData =
        response.status || (response as any).data?.status || (response as any)
      setStatus(statusData)
      console.log("✅ Status set successfully:", statusData)
    } catch (err: any) {
      console.error("❌ Error fetching subscription status:", err)
      setError("Failed to load subscription status.")
    }
  }, [callAPI])

  const cancelSubscription = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await callAPI<void>({ method: "post", url: "/subscription/cancel" })
      setSubscription(null)
      await fetchStatus()
    } catch (err) {
      console.error("Error canceling subscription:", err)
      setError("Failed to cancel subscription.")
    } finally {
      setLoading(false)
    }
  }, [callAPI, fetchStatus])

  const fetchPlans = useCallback(async (): Promise<void> => {
    setError(null)
    try {
      console.log("📡 Fetching plans...")
      const response = await callAPI<{ plans: SubscriptionPlan[] }>({
        method: "get",
        url: "/subscription/plans",
      })

      console.log("📡 Plans API response:", response)
      const plansData =
        response.plans || (response as any).data?.plans || (response as any)

      if (Array.isArray(plansData)) {
        setPlans(plansData)
        console.log("✅ Plans set successfully:", plansData)
      } else {
        console.error("❌ Plans data is not an array:", plansData)
        setError("Invalid plans data received")
      }
    } catch (err: any) {
      console.error("❌ Error fetching subscription plans:", err)
      setError("Failed to load subscription plans.")
    }
  }, [callAPI])

  const fetchLimits = useCallback(async (): Promise<void> => {
    setError(null)
    try {
      console.log("📡 Fetching limits...")
      const response = await callAPI<{ limits: UserLimits }>({
        method: "get",
        url: "/subscription/limits",
      })

      console.log("📡 Limits API response:", response)
      const limitsData =
        response.limits || (response as any).data?.limits || (response as any)
      setLimits(limitsData)
      console.log("✅ Limits set successfully:", limitsData)
    } catch (err: any) {
      console.error("❌ Error fetching user limits:", err)
      setError("Failed to load user limits.")
    }
  }, [callAPI])

  const createCheckoutSession = useCallback(
    async (
      planId: string,
      billingCycle: "monthly" | "yearly" = "monthly",
    ): Promise<{ sessionUrl: string } | null> => {
      setLoading(true)
      setError(null)
      try {
        const response = await callAPI<{ sessionUrl: string }>({
          method: "post",
          url: "/subscription/create-session",
          data: {
            planId,
            billingCycle,
            successUrl: `${window.location.origin}/subscription/success`,
            cancelUrl: `${window.location.origin}/subscription`,
          },
        })

        const sessionData = response.sessionUrl
          ? response
          : (response as any).data
        return sessionData
      } catch (err) {
        console.error("Error creating checkout session:", err)
        setError("Failed to create checkout session.")
        return null
      } finally {
        setLoading(false)
      }
    },
    [callAPI],
  )

  const changePlan = useCallback(
    async (
      newPlanId: string,
      billingCycle: "monthly" | "yearly" = "monthly",
    ): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const response = await callAPI<{
          message: string
          subscription: SubscriptionStatus
          effectiveDate: string
          prorationAmount?: number
          pendingChange?: {
            newPlan: string
            newBillingCycle: string
            changeDate: string
          }
        }>({
          method: "post",
          url: "/subscription/change-plan",
          data: { newPlanId, billingCycle },
        })

        console.log("✅ Plan change response:", response)
        const responseData = (response as any).data || response

        if (responseData.subscription) {
          setStatus(responseData.subscription)
        }

        await fetchLimits()
      } catch (err: any) {
        console.error("Error changing plan:", err)
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to change subscription plan."
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [callAPI, fetchLimits],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  subRef.current = fetchSubscriptionDetails
  histRef.current = fetchBillingHistory
  statusRef.current = fetchStatus
  limitsRef.current = fetchLimits

  const refreshAll = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await Promise.all([fetchPlans(), fetchStatus(), fetchLimits()])
    } catch (err) {
      console.error("Error refreshing all subscription data:", err)
    } finally {
      setLoading(false)
    }
  }, [fetchPlans, fetchStatus, fetchLimits])

  // FIXED: Wait for session before loading data
  useEffect(() => {
    // Don't do anything if session is still loading
    if (sessionStatus === "loading") {
      console.log("🔄 Session is loading, waiting...")
      return
    }

    // If user is not authenticated, don't load subscription data
    if (sessionStatus === "unauthenticated" || !session) {
      console.log("❌ User not authenticated, skipping subscription data load")
      setLoading(false)
      setError("Please log in to view subscription information")
      return
    }

    // User is authenticated, load the data
    if (sessionStatus === "authenticated" && session) {
      console.log("✅ User authenticated, starting subscription data load...")
      const initLoad = async () => {
        setLoading(true)
        try {
          console.log("🚀 Starting initial subscription data load...")
          await Promise.all([fetchPlans(), fetchStatus(), fetchLimits()])
          console.log("✅ Initial subscription data load complete")
        } catch (error) {
          console.error("❌ Error in initial load:", error)
        } finally {
          setLoading(false)
        }
      }

      initLoad()
    }
  }, [sessionStatus, session, fetchPlans, fetchStatus, fetchLimits])

  // Convenience computed values
  const canCreateGoal = limits?.canCreateGoal ?? false
  const hasUnlimitedGoals = limits?.hasUnlimitedGoals ?? false
  const maxGoals = limits?.maxGoals ?? 3
  const currentGoalCount = limits?.currentGoalCount ?? 0
  const hasDMMessaging = limits?.hasDMMessaging ?? false
  const hasPrivateRooms = limits?.hasPrivateRooms ?? false
  const hasWeeklyMeetings = limits?.hasWeeklyMeetings ?? false
  const isInTrial = limits?.isInTrial ?? false
  const daysUntilTrialEnd = limits?.daysUntilTrialEnd ?? 0

  return {
    // Legacy support
    subscription,
    billingHistory,
    loading,
    error,
    fetchSubscriptionDetails,
    fetchBillingHistory,
    updateSubscription,
    cancelSubscription,
    clearError,
    refreshAll,

    // New pricing tier functionality
    plans,
    status,
    limits,
    fetchPlans,
    fetchStatus,
    fetchLimits,
    createCheckoutSession,
    changePlan,

    // Convenience values
    canCreateGoal,
    hasUnlimitedGoals,
    maxGoals,
    currentGoalCount,
    hasDMMessaging,
    hasPrivateRooms,
    hasWeeklyMeetings,
    isInTrial,
    daysUntilTrialEnd,
  }
}
