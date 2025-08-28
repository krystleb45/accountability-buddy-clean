/* eslint-disable style/spaced-comment */

"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

import type { User } from "@/types/mongoose.gen"

import {
  createSubscriptionSession,
  getUserLimits,
} from "@/api/subscription/subscriptionApi"

export default function useSubscription() {
  const {
    data: limits,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["limits"],
    queryFn: getUserLimits,
  })

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch user limits", {
        description: error.message,
      })
    }
  }, [error])

  const { mutate: createCheckoutSession } = useMutation({
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
  const isInTrial = limits?.isInTrial ?? false
  const daysUntilTrialEnd = limits?.daysUntilTrialEnd ?? 0

  return {
    isLoading,

    //// plans,
    //// status,
    //// limits,
    //// fetchPlans,
    //// fetchStatus,
    //// fetchLimits,
    createCheckoutSession,
    //// changePlan,

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
