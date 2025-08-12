// src/app/subscription/page.client.tsx - FIXED: Null safety for plans array
"use client"

import { motion } from "motion/react"
import Link from "next/link"
import React, { useState } from "react"

import {
  showBillingCycleChangeToast,
  showCancellationSuccessToast,
  showDowngradeScheduledToast,
  showSubscriptionErrorToast,
  showUpgradeSuccessToast,
} from "@/components/Toasts"
import useSubscription from "@/hooks/useSubscription"

export default function SubscriptionClient() {
  const {
    plans,
    status,
    limits,
    loading,
    error,
    createCheckoutSession,
    cancelSubscription,
    changePlan,

    // Convenience values
    isInTrial,
    daysUntilTrialEnd,
  } = useSubscription()

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  )
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState<string | null>(null)

  // Debug: Log what we're getting
  console.log("useSubscription data:", {
    plans,
    status,
    limits,
    loading,
    error,
  })

  // FIXED: Add null checks and ensure plans is an array
  const plansArray = Array.isArray(plans) ? plans : []
  const currentPlan = plansArray.find(
    (plan) => plan.id === status?.currentPlan?.toLowerCase(),
  )
  const currentTierIndex =
    plansArray.findIndex(
      (plan) => plan.id === status?.currentPlan?.toLowerCase(),
    ) ?? -1

  const isUpgrade = (planId: string) => {
    if (!plansArray || plansArray.length === 0 || currentTierIndex === -1)
      return false
    const planIndex = plansArray.findIndex((p) => p.id === planId)
    return planIndex > currentTierIndex
  }

  const isDowngrade = (planId: string) => {
    if (!plansArray || plansArray.length === 0 || currentTierIndex === -1)
      return false
    const planIndex = plansArray.findIndex((p) => p.id === planId)
    return planIndex < currentTierIndex && planIndex >= 0
  }

  const handleSubscribe = async (planId: string) => {
    setActionLoading(true)
    try {
      const session = await createCheckoutSession(planId, billingCycle)
      if (session?.sessionUrl) {
        window.location.href = session.sessionUrl
      }
    } catch (err) {
      console.error("Subscription error:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePlanChange = async (newPlanId: string) => {
    setActionLoading(true)
    try {
      await changePlan(newPlanId, billingCycle)
      setShowChangeModal(null)

      // Show appropriate success notification
      const newPlan = plansArray.find((p) => p.id === newPlanId)
      const isUpgradeOption = isUpgrade(newPlanId)
      const isDowngradeOption = isDowngrade(newPlanId)

      if (isUpgradeOption) {
        showUpgradeSuccessToast(newPlan?.name || newPlanId)
      } else if (isDowngradeOption) {
        // For downgrades, show scheduled message
        const effectiveDate = new Date()
        effectiveDate.setMonth(effectiveDate.getMonth() + 1) // Approximate next billing
        showDowngradeScheduledToast(
          newPlan?.name || newPlanId,
          effectiveDate.toISOString(),
        )
      } else {
        // Billing cycle change
        showBillingCycleChangeToast(billingCycle, new Date().toISOString())
      }
    } catch (err: any) {
      console.error("Plan change error:", err)
      showSubscriptionErrorToast(
        err.message || "Failed to change plan. Please try again.",
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await cancelSubscription()
      setShowCancelModal(false)
      showCancellationSuccessToast()
    } catch (err: any) {
      console.error("Cancellation error:", err)
      showSubscriptionErrorToast(
        "Failed to cancel subscription. Please try again.",
      )
    } finally {
      setActionLoading(false)
    }
  }

  const getCurrentPrice = () => {
    if (!currentPlan) return 0
    return billingCycle === "yearly" && currentPlan.yearlyPrice
      ? currentPlan.yearlyPrice
      : currentPlan.price
  }

  const getNewPrice = (plan: any) => {
    if (!plan) return 0
    return billingCycle === "yearly" && plan.yearlyPrice
      ? plan.yearlyPrice
      : plan.price
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-kelly-green"></div>
          <p className="text-white">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-kelly-green px-4 py-2 text-black hover:bg-opacity-80"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show loading if plans haven't loaded yet
  if (!plansArray || plansArray.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-kelly-green"></div>
          <p className="text-white">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Trial Banner */}
      {isInTrial && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-kelly-green to-green-600 p-4 text-center text-black"
        >
          <span className="font-semibold">
            {daysUntilTrialEnd > 0
              ? `${daysUntilTrialEnd} days left in your free trial`
              : "Your free trial is ending soon"}
          </span>
          <span className="ml-2">- Choose a plan to continue!</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-6 py-12 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold text-kelly-green md:text-5xl">
          {status?.isActive ? "Manage Your Subscription" : "Choose Your Plan"}
        </h1>
        {status?.isActive ? (
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            You're currently on the{" "}
            <strong className="text-kelly-green">{status.currentPlan}</strong>{" "}
            plan.
            {status.renewalDate && (
              <>
                <br />
                Next renewal:{" "}
                <strong>
                  {new Date(status.renewalDate).toLocaleDateString()}
                </strong>
              </>
            )}
          </p>
        ) : (
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Start with our free trial, then upgrade to unlock the full potential
            of accountability partnering
          </p>
        )}
      </motion.header>

      <div className="mx-auto max-w-7xl px-6 pb-12">
        {status?.isActive ? (
          // Current subscription management
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl space-y-8"
          >
            {/* Current Plan Card */}
            <div className="rounded-xl border border-kelly-green bg-gray-900 p-8">
              <h2 className="mb-4 text-2xl font-bold">
                Current Plan: {status.currentPlan}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Plan Details:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      💰 Paying: ${getCurrentPrice()}/
                      {billingCycle === "monthly" ? "month" : "year"}
                    </li>
                    <li>🔄 Billing Cycle: {billingCycle}</li>
                    <li>
                      📅 Next Billing:{" "}
                      {status.renewalDate
                        ? new Date(status.renewalDate).toLocaleDateString()
                        : "N/A"}
                    </li>
                    <li>
                      📊 Status:{" "}
                      <span className="capitalize text-kelly-green">
                        {status.subscription_status}
                      </span>
                    </li>{" "}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Your Features:</h3>
                  {limits && (
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <span className="mr-2 text-kelly-green">✓</span>
                        {limits.hasUnlimitedGoals
                          ? "Unlimited goals"
                          : `Up to ${limits.maxGoals} goals`}
                        {!limits.hasUnlimitedGoals &&
                          ` (${limits.currentGoalCount}/${limits.maxGoals} used)`}
                      </li>
                      {limits.hasStreakTracker && (
                        <li className="flex items-center">
                          <span className="mr-2 text-kelly-green">✓</span>
                          Streak tracker
                        </li>
                      )}
                      {limits.hasDMMessaging && (
                        <li className="flex items-center">
                          <span className="mr-2 text-kelly-green">✓</span>
                          Direct messaging
                        </li>
                      )}
                      {limits.hasPrivateRooms && (
                        <li className="flex items-center">
                          <span className="mr-2 text-kelly-green">✓</span>
                          Private chatrooms
                        </li>
                      )}
                      {limits.hasWeeklyMeetings && (
                        <li className="flex items-center">
                          <span className="mr-2 text-kelly-green">✓</span>
                          Weekly accountability meetings
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-700 pt-6">
                <Link href="/dashboard" className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg bg-kelly-green px-6 py-3 font-semibold text-black transition-all hover:bg-opacity-80"
                  >
                    Go to Dashboard
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCancelModal(true)}
                  className="rounded-lg bg-red-600 px-6 py-3 text-white transition-all hover:bg-red-700"
                >
                  Cancel Subscription
                </motion.button>
              </div>
            </div>

            {/* Available Plan Changes */}
            <div>
              <h2 className="mb-6 text-center text-2xl font-bold">
                Available Plan Changes
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plansArray
                  .filter(
                    (plan) =>
                      plan.id !== status?.currentPlan?.toLowerCase() &&
                      plan.id !== "free-trial",
                  )
                  .map((plan) => {
                    const isUpgradeOption = isUpgrade(plan.id)
                    const isDowngradeOption = isDowngrade(plan.id)
                    const newPrice = getNewPrice(plan)
                    const currentPrice = getCurrentPrice()
                    const priceDiff = newPrice - currentPrice

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl border-2 bg-gray-900 p-6 transition-all hover:scale-105 ${
                          isUpgradeOption
                            ? "border-green-500"
                            : isDowngradeOption
                              ? "border-yellow-500"
                              : "border-gray-600"
                        }`}
                      >
                        <div className="mb-4 text-center">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            {isUpgradeOption && (
                              <span className="rounded bg-green-500 px-2 py-1 text-xs text-white">
                                UPGRADE
                              </span>
                            )}
                            {isDowngradeOption && (
                              <span className="rounded bg-yellow-500 px-2 py-1 text-xs text-black">
                                DOWNGRADE
                              </span>
                            )}
                          </div>
                          <div className="mb-3">
                            <span className="text-2xl font-bold">
                              ${newPrice}
                            </span>
                            <span className="text-gray-400">
                              /{billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                            <div className="mt-1 text-sm">
                              {priceDiff > 0 ? (
                                <span className="text-green-400">
                                  +${priceDiff} from current plan
                                </span>
                              ) : priceDiff < 0 ? (
                                <span className="text-yellow-400">
                                  ${Math.abs(priceDiff)} savings from current
                                  plan
                                </span>
                              ) : (
                                <span className="text-gray-400">
                                  Same price as current plan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ul className="mb-6 space-y-2 text-sm">
                          {plan.features?.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 mt-0.5 text-kelly-green">
                                ✓
                              </span>
                              <span className="text-gray-300">{feature}</span>
                            </li>
                          ))}
                          {plan.features && plan.features.length > 4 && (
                            <li className="text-xs text-gray-400">
                              +{plan.features.length - 4} more features
                            </li>
                          )}
                        </ul>

                        <button
                          onClick={() => setShowChangeModal(plan.id)}
                          disabled={actionLoading}
                          className={`w-full rounded-lg px-4 py-3 font-semibold transition-all disabled:opacity-50 ${
                            isUpgradeOption
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : isDowngradeOption
                                ? "bg-yellow-600 text-black hover:bg-yellow-700"
                                : "bg-gray-700 text-white hover:bg-gray-600"
                          }`}
                        >
                          {isUpgradeOption
                            ? "Upgrade"
                            : isDowngradeOption
                              ? "Downgrade"
                              : "Switch"}{" "}
                          to {plan.name}
                        </button>
                      </motion.div>
                    )
                  })}
              </div>
            </div>
          </motion.div>
        ) : (
          // Plan selection for new subscribers
          <>
            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-md px-6 py-2 transition-all ${
                    billingCycle === "monthly"
                      ? "bg-kelly-green text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`rounded-md px-6 py-2 transition-all ${
                    billingCycle === "yearly"
                      ? "bg-kelly-green text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Yearly
                  <span className="ml-2 rounded bg-green-500 px-2 py-1 text-xs text-white">
                    Save 17%
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Subscription Plans Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {plansArray.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`relative rounded-xl border-2 bg-gray-900 p-6 transition-all duration-300 hover:scale-105 ${
                    plan.isPopular
                      ? "border-kelly-green shadow-lg shadow-kelly-green/20"
                      : "border-gray-600"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-kelly-green px-4 py-1 text-sm font-bold text-black">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6 text-center">
                    <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                    <div className="mb-3">
                      {plan.trialDays && plan.price === 0 ? (
                        <div>
                          <span className="text-3xl font-bold text-kelly-green">
                            Free
                          </span>
                          <p className="text-sm text-gray-400">
                            {plan.trialDays} days
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-white">
                            $
                            {billingCycle === "yearly" && plan.yearlyPrice
                              ? plan.yearlyPrice
                              : plan.price}
                          </span>
                          <span className="text-gray-400">
                            /{billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                          {billingCycle === "yearly" && plan.yearlyPrice && (
                            <p className="mt-1 text-sm text-green-400">
                              Save ${plan.price * 12 - plan.yearlyPrice}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg
                          className="mr-3 mt-0.5 size-5 shrink-0 text-kelly-green"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={actionLoading}
                    className={`w-full rounded-lg px-4 py-3 font-semibold transition-all disabled:opacity-50 ${
                      plan.isPopular || (plan.trialDays && plan.price === 0)
                        ? "bg-kelly-green text-black hover:bg-opacity-80"
                        : "border border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {actionLoading
                      ? "Processing..."
                      : plan.trialDays && plan.price === 0
                        ? "Start Free Trial"
                        : `Choose ${plan.name}`}
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 space-y-4 text-center"
            >
              <p className="text-gray-400">
                ✅ 7-day money-back guarantee • ✅ Cancel anytime • ✅ Secure
                payment
              </p>
              <p className="text-sm text-gray-500">
                Join thousands of users achieving their goals with
                accountability partners
              </p>
            </motion.div>
          </>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-xl border border-red-500 bg-gray-900 p-6"
            >
              <h3 className="mb-4 text-xl font-bold text-red-400">
                Cancel Subscription
              </h3>
              <p className="mb-6 text-gray-300">
                Are you sure you want to cancel your subscription? You'll lose
                access to premium features at the end of your current billing
                period.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Plan Change Confirmation Modal */}
        {showChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-xl border border-kelly-green bg-gray-900 p-6"
            >
              {(() => {
                const newPlan = plansArray.find((p) => p.id === showChangeModal)
                const isUpgradeOption = isUpgrade(showChangeModal)
                const newPrice = getNewPrice(newPlan)
                const currentPrice = getCurrentPrice()
                const priceDiff = newPrice - currentPrice

                return (
                  <>
                    <h3 className="mb-4 text-xl font-bold text-kelly-green">
                      {isUpgradeOption ? "Upgrade" : "Change"} Plan
                    </h3>
                    <div className="mb-6 space-y-2 text-gray-300">
                      <p>
                        Current: <strong>{status?.currentPlan}</strong> ($
                        {currentPrice}/
                        {billingCycle === "monthly" ? "mo" : "yr"})
                      </p>
                      <p>
                        New: <strong>{newPlan?.name}</strong> (${newPrice}/
                        {billingCycle === "monthly" ? "mo" : "yr"})
                      </p>
                      {priceDiff !== 0 && (
                        <p
                          className={
                            priceDiff > 0 ? "text-green-400" : "text-yellow-400"
                          }
                        >
                          {priceDiff > 0 ? "Additional cost" : "Savings"}: $
                          {Math.abs(priceDiff)}/
                          {billingCycle === "monthly" ? "mo" : "yr"}
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        {isUpgradeOption
                          ? "Changes take effect immediately with prorated billing."
                          : "Changes take effect at your next billing cycle."}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowChangeModal(null)}
                        className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePlanChange(showChangeModal)}
                        disabled={actionLoading}
                        className="flex-1 rounded-lg bg-kelly-green px-4 py-2 text-black hover:bg-opacity-80 disabled:opacity-50"
                      >
                        {actionLoading ? "Processing..." : "Confirm Change"}
                      </button>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
