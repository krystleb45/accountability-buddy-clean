"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { isBefore } from "date-fns"
import { useEffect } from "react"
import { toast } from "sonner"

import type { User } from "@/types/mongoose.gen"

import {
  createSubscriptionSession,
  getUserLimits,
} from "@/api/subscription/subscription-api"
import { useAuth } from "@/context/auth/auth-context"

export default function useSubscription() {
  const { user, loading: isUserLoading } = useAuth()

  const subscriptionStatus = user?.subscription_status
  const isSubscriptionActive =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trial" ||
    (subscriptionStatus === "canceled" &&
      !!user?.subscriptionEndDate &&
      isBefore(new Date(), user.subscriptionEndDate))

  const {
    data: limits,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["limits"],
    queryFn: getUserLimits,
    enabled: isSubscriptionActive,
  })

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch user limits", {
        description: error.message,
      })
    }
  }, [error])

  const {
    mutate: createCheckoutSession,
    isPending: isCreatingCheckoutSession,
  } = useMutation({
    mutationFn: async ({
      planId,
      billingCycle = "monthly",
    }: {
      planId: Exclude<User["subscriptionTier"], "free-trial" | undefined>
      billingCycle?: "monthly" | "yearly"
    }) => createSubscriptionSession(planId, billingCycle),
    onSuccess: (data) => {
      window.location.href = data.sessionUrl
    },
    onError: (error) => {
      toast.error("Failed to create checkout session", {
        description: error.message,
      })
    },
  })

  // Convenience computed values
  const canCreateGoal = limits?.canCreateMore ?? false
  const hasUnlimitedGoals = limits?.hasUnlimitedGoals ?? false
  const maxGoals = limits?.maxGoals ?? 3
  const currentGoalCount = limits?.currentGoalCount ?? 0

  const hasDMMessaging = limits?.hasDMMessaging ?? false
  const hasPrivateRooms = limits?.hasPrivateRooms ?? false
  const hasWeeklyMeetings = limits?.hasWeeklyMeetings ?? false
  const hasStreakTracker = limits?.hasStreakTracker ?? false

  const isInTrial = limits?.isInTrial ?? false
  const daysUntilTrialEnd = limits?.daysUntilTrialEnd ?? 0
  const trialEndDate = user?.trial_end_date

  const billingCycle = user?.billing_cycle ?? "monthly"
  const subscriptionTier = user?.subscriptionTier
  const nextBillingDate = user?.next_billing_date
  const subscriptionEndDate = user?.subscriptionEndDate

  return {
    isLoading: (isLoading && isSubscriptionActive) || isUserLoading,

    subscriptionTier,
    subscriptionStatus,
    isSubscriptionActive,
    subscriptionEndDate,
    nextBillingDate,
    billingCycle,

    createCheckoutSession,
    isCreatingCheckoutSession,

    // Convenience values
    canCreateGoal,
    hasUnlimitedGoals,
    maxGoals,
    currentGoalCount,

    hasDMMessaging,
    hasPrivateRooms,
    hasWeeklyMeetings,
    hasStreakTracker,

    isInTrial,
    daysUntilTrialEnd,
    trialEndDate,
  }
}
