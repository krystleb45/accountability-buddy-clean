// src/app/subscription/page.client.tsx - FIXED: Null safety for plans array
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useSubscription from '@/hooks/useSubscription'
import {
  showUpgradeSuccessToast,
  showDowngradeScheduledToast,
  showBillingCycleChangeToast,
  showCancellationSuccessToast,
  showSubscriptionErrorToast,
} from '@/components/Toasts'

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

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState<string | null>(null)

  // Debug: Log what we're getting
  console.log('useSubscription data:', { plans, status, limits, loading, error });

  // FIXED: Add null checks and ensure plans is an array
  const plansArray = Array.isArray(plans) ? plans : [];
  const currentPlan = plansArray.find(plan => plan.id === status?.currentPlan?.toLowerCase())
  const currentTierIndex = plansArray.findIndex(plan => plan.id === status?.currentPlan?.toLowerCase()) ?? -1

  const handleSubscribe = async (planId: string) => {
    setActionLoading(true)
    try {
      const session = await createCheckoutSession(planId, billingCycle)
      if (session?.sessionUrl) {
        window.location.href = session.sessionUrl
      }
    } catch (err) {
      console.error('Subscription error:', err)
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
      const newPlan = plansArray.find(p => p.id === newPlanId)
      const isUpgradeOption = isUpgrade(newPlanId)
      const isDowngradeOption = isDowngrade(newPlanId)

      if (isUpgradeOption) {
        showUpgradeSuccessToast(newPlan?.name || newPlanId)
      } else if (isDowngradeOption) {
        // For downgrades, show scheduled message
        const effectiveDate = new Date()
        effectiveDate.setMonth(effectiveDate.getMonth() + 1) // Approximate next billing
        showDowngradeScheduledToast(newPlan?.name || newPlanId, effectiveDate.toISOString())
      } else {
        // Billing cycle change
        showBillingCycleChangeToast(billingCycle, new Date().toISOString())
      }

    } catch (err: any) {
      console.error('Plan change error:', err)
      showSubscriptionErrorToast(err.message || 'Failed to change plan. Please try again.')
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
      console.error('Cancellation error:', err)
      showSubscriptionErrorToast('Failed to cancel subscription. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const isUpgrade = (planId: string) => {
    if (!plansArray || plansArray.length === 0 || currentTierIndex === -1) return false
    const planIndex = plansArray.findIndex(p => p.id === planId)
    return planIndex > currentTierIndex
  }

  const isDowngrade = (planId: string) => {
    if (!plansArray || plansArray.length === 0 || currentTierIndex === -1) return false
    const planIndex = plansArray.findIndex(p => p.id === planId)
    return planIndex < currentTierIndex && planIndex >= 0
  }

  const getCurrentPrice = () => {
    if (!currentPlan) return 0
    return billingCycle === 'yearly' && currentPlan.yearlyPrice
      ? currentPlan.yearlyPrice
      : currentPlan.price
  }

  const getNewPrice = (plan: any) => {
    if (!plan) return 0
    return billingCycle === 'yearly' && plan.yearlyPrice
      ? plan.yearlyPrice
      : plan.price
  }

  // Show loading state
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kelly-green mx-auto mb-4"></div>
        <p className="text-white">Loading subscription plans...</p>
      </div>
    </div>
  )

  // Show error state
  if (error) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-kelly-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  // Show loading if plans haven't loaded yet
  if (!plansArray || plansArray.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kelly-green mx-auto mb-4"></div>
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
          className="bg-gradient-to-r from-kelly-green to-green-600 text-black p-4 text-center"
        >
          <span className="font-semibold">
            {daysUntilTrialEnd > 0
              ? `${daysUntilTrialEnd} days left in your free trial`
              : 'Your free trial is ending soon'
            }
          </span>
          <span className="ml-2">- Choose a plan to continue!</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-12 px-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-kelly-green mb-4">
          {status?.isActive ? 'Manage Your Subscription' : 'Choose Your Plan'}
        </h1>
        {status?.isActive ? (
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            You're currently on the <strong className="text-kelly-green">{status.currentPlan}</strong> plan.
            {status.renewalDate && (
              <>
                <br />Next renewal: <strong>{new Date(status.renewalDate).toLocaleDateString()}</strong>
              </>
            )}
          </p>
        ) : (
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start with our free trial, then upgrade to unlock the full potential of accountability partnering
          </p>
        )}
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {status?.isActive ? (
          // Current subscription management
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Current Plan Card */}
            <div className="bg-gray-900 rounded-xl p-8 border border-kelly-green">
              <h2 className="text-2xl font-bold mb-4">Current Plan: {status.currentPlan}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Plan Details:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>💰 Paying: ${getCurrentPrice()}/{billingCycle === 'monthly' ? 'month' : 'year'}</li>
                    <li>🔄 Billing Cycle: {billingCycle}</li>
                    <li>📅 Next Billing: {status.renewalDate ? new Date(status.renewalDate).toLocaleDateString() : 'N/A'}</li>
                    <li>📊 Status: <span className="text-kelly-green capitalize">{status.subscription_status}</span></li>                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Features:</h3>
                  {limits && (
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <span className="text-kelly-green mr-2">✓</span>
                        {limits.hasUnlimitedGoals ? 'Unlimited goals' : `Up to ${limits.maxGoals} goals`}
                        {!limits.hasUnlimitedGoals && ` (${limits.currentGoalCount}/${limits.maxGoals} used)`}
                      </li>
                      {limits.hasStreakTracker && (
                        <li className="flex items-center">
                          <span className="text-kelly-green mr-2">✓</span>
                          Streak tracker
                        </li>
                      )}
                      {limits.hasDMMessaging && (
                        <li className="flex items-center">
                          <span className="text-kelly-green mr-2">✓</span>
                          Direct messaging
                        </li>
                      )}
                      {limits.hasPrivateRooms && (
                        <li className="flex items-center">
                          <span className="text-kelly-green mr-2">✓</span>
                          Private chatrooms
                        </li>
                      )}
                      {limits.hasWeeklyMeetings && (
                        <li className="flex items-center">
                          <span className="text-kelly-green mr-2">✓</span>
                          Weekly accountability meetings
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-700">
                <Link href="/dashboard" className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-kelly-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-80 transition-all"
                  >
                    Go to Dashboard
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCancelModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all"
                >
                  Cancel Subscription
                </motion.button>
              </div>
            </div>

            {/* Available Plan Changes */}
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">Available Plan Changes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plansArray.filter(plan => plan.id !== status?.currentPlan?.toLowerCase() && plan.id !== 'free-trial').map((plan) => {
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
                      className={`bg-gray-900 rounded-xl p-6 border-2 transition-all hover:scale-105 ${
                        isUpgradeOption ? 'border-green-500' : isDowngradeOption ? 'border-yellow-500' : 'border-gray-600'
                      }`}
                    >
                      <div className="text-center mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          {isUpgradeOption && <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">UPGRADE</span>}
                          {isDowngradeOption && <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs">DOWNGRADE</span>}
                        </div>
                        <div className="mb-3">
                          <span className="text-2xl font-bold">${newPrice}</span>
                          <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                          <div className="text-sm mt-1">
                            {priceDiff > 0 ? (
                              <span className="text-green-400">+${priceDiff} from current plan</span>
                            ) : priceDiff < 0 ? (
                              <span className="text-yellow-400">${Math.abs(priceDiff)} savings from current plan</span>
                            ) : (
                              <span className="text-gray-400">Same price as current plan</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6 text-sm">
                        {plan.features?.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-kelly-green mr-2 mt-0.5">✓</span>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                        {plan.features && plan.features.length > 4 && (
                          <li className="text-gray-400 text-xs">+{plan.features.length - 4} more features</li>
                        )}
                      </ul>

                      <button
                        onClick={() => setShowChangeModal(plan.id)}
                        disabled={actionLoading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                          isUpgradeOption
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : isDowngradeOption
                            ? 'bg-yellow-600 text-black hover:bg-yellow-700'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {isUpgradeOption ? 'Upgrade' : isDowngradeOption ? 'Downgrade' : 'Switch'} to {plan.name}
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
              className="flex justify-center mb-8"
            >
              <div className="bg-gray-900 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-kelly-green text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-md transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-kelly-green text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Save 17%
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Subscription Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plansArray.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`relative bg-gray-900 rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                    plan.isPopular
                      ? 'border-kelly-green shadow-lg shadow-kelly-green/20'
                      : 'border-gray-600'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-kelly-green text-black px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-3">
                      {plan.trialDays && plan.price === 0 ? (
                        <div>
                          <span className="text-3xl font-bold text-kelly-green">Free</span>
                          <p className="text-gray-400 text-sm">{plan.trialDays} days</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-white">
                            ${billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                          </span>
                          <span className="text-gray-400">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                          {billingCycle === 'yearly' && plan.yearlyPrice && (
                            <p className="text-green-400 text-sm mt-1">
                              Save ${(plan.price * 12) - plan.yearlyPrice}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-kelly-green mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={actionLoading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                      plan.isPopular || (plan.trialDays && plan.price === 0)
                        ? 'bg-kelly-green text-black hover:bg-opacity-80'
                        : 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    {actionLoading ? 'Processing...' :
                     plan.trialDays && plan.price === 0 ? 'Start Free Trial' :
                     `Choose ${plan.name}`}
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-12 space-y-4"
            >
              <p className="text-gray-400">
                ✅ 7-day money-back guarantee • ✅ Cancel anytime • ✅ Secure payment
              </p>
              <p className="text-gray-500 text-sm">
                Join thousands of users achieving their goals with accountability partners
              </p>
            </motion.div>
          </>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-red-500"
            >
              <h3 className="text-xl font-bold text-red-400 mb-4">Cancel Subscription</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Plan Change Confirmation Modal */}
        {showChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-kelly-green"
            >
              {(() => {
                const newPlan = plansArray.find(p => p.id === showChangeModal)
                const isUpgradeOption = isUpgrade(showChangeModal)
                const newPrice = getNewPrice(newPlan)
                const currentPrice = getCurrentPrice()
                const priceDiff = newPrice - currentPrice

                return (
                  <>
                    <h3 className="text-xl font-bold text-kelly-green mb-4">
                      {isUpgradeOption ? 'Upgrade' : 'Change'} Plan
                    </h3>
                    <div className="text-gray-300 mb-6 space-y-2">
                      <p>Current: <strong>{status?.currentPlan}</strong> (${currentPrice}/{billingCycle === 'monthly' ? 'mo' : 'yr'})</p>
                      <p>New: <strong>{newPlan?.name}</strong> (${newPrice}/{billingCycle === 'monthly' ? 'mo' : 'yr'})</p>
                      {priceDiff !== 0 && (
                        <p className={priceDiff > 0 ? 'text-green-400' : 'text-yellow-400'}>
                          {priceDiff > 0 ? 'Additional cost' : 'Savings'}: ${Math.abs(priceDiff)}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        {isUpgradeOption
                          ? 'Changes take effect immediately with prorated billing.'
                          : 'Changes take effect at your next billing cycle.'
                        }
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowChangeModal(null)}
                        className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePlanChange(showChangeModal)}
                        disabled={actionLoading}
                        className="flex-1 bg-kelly-green text-black py-2 px-4 rounded-lg hover:bg-opacity-80 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Confirm Change'}
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
