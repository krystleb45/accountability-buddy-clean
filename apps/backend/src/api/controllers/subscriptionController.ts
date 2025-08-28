import type { RequestHandler } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"
import type { CreateCheckoutSessionBody } from "../routes/subscription"

import { logger } from "../../utils/winstonLogger"
import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"
import { GoalService } from "../services/goal-service"
import { stripe } from "../services/StripeService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

/**
 * GET /api/subscription/plans
 * Get all available subscription plans
 */
export const getPlans: RequestHandler = catchAsync(async (_req, res) => {
  const plans = [
    {
      id: "free-trial",
      name: "Free Trial",
      price: 0,
      yearlyPrice: 0,
      description: "Full access to get you started",
      features: [
        "All Pro features included",
        "Full community access",
        "Unlimited goals",
        "Badge system & XP",
        "DM messaging",
        "No commitment",
      ],
      isPopular: false,
      trialDays: 14,
    },
    {
      id: "basic",
      name: "Basic",
      price: 5,
      yearlyPrice: 50,
      description: "Perfect for beginners",
      features: [
        "3 active goals",
        "Streak tracker",
        "Daily prompts",
        "Group chat access",
        "Basic progress tracking",
      ],
      isPopular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: 15,
      yearlyPrice: 150,
      description: "Most popular choice",
      features: [
        "Unlimited goals",
        "Full community access",
        "Badge system & XP",
        "DM messaging",
        "Advanced analytics",
        "Priority support",
      ],
      isPopular: true,
    },
    {
      id: "elite",
      name: "Elite",
      price: 30,
      yearlyPrice: 300,
      description: "For serious achievers",
      features: [
        "Everything in Pro",
        "Private chatrooms",
        "Early feature access",
        "Leaderboard perks",
        "Weekly accountability meetings",
        "Personal coach matching",
      ],
      isPopular: false,
    },
  ]

  sendResponse(res, 200, true, "Plans fetched successfully", { plans })
})

/**
 * POST /api/subscription/create-session
 * Create a Stripe checkout session for subscription
 */
export const createCheckoutSession: RequestHandler = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, CreateCheckoutSessionBody>,
    res,
    next,
  ) => {
    const userId = req.user.id
    const user = await User.findById(userId)
    const { planId, billingCycle = "monthly", successUrl, cancelUrl } = req.body

    if (!planId) {
      return next(createError("Plan ID is required", 400))
    }

    if (planId === "free-trial") {
      return next(createError("Free trial doesn't require payment", 400))
    }

    const prices = await stripe.prices.list({
      lookup_keys: [`${planId}_${billingCycle}`],
      expand: ["data.product"],
      limit: 1,
    })

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      mode: "subscription",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}?canceled=true`,
    })

    sendResponse(res, 200, true, "Checkout session created", {
      sessionUrl: session.url,
      sessionId: session.id,
      planId,
      billingCycle,
    })
  },
)

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */
export const getSubscriptionStatus: RequestHandler = catchAsync(
  async (req, res, next) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    if (!userId) {
      return next(createError("User not authenticated", 401))
    }

    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    const isInTrial = user.isInTrial()
    const daysUntilTrialEnd = user.getDaysUntilTrialEnd()

    sendResponse(res, 200, true, "Subscription status fetched successfully", {
      status: {
        currentPlan: user.subscriptionTier,
        subscription_status: user.subscription_status,
        isActive: ["active", "trial", "trialing"].includes(
          user.subscription_status,
        ),
        isInTrial,
        daysUntilTrialEnd,
        trial_end_date: user.trial_end_date,
        renewalDate: user.next_billing_date,
        billingCycle: user.billing_cycle,
      },
    })
  },
)

/**
 * GET /api/subscription/limits
 * Get current user's feature limits based on their plan
 */
export const getUserLimits: RequestHandler = catchAsync(
  async (req, res, next) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user.id

    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    const { canCreate, currentCount, maxAllowed } =
      await GoalService.canUserCreateGoal(userId)

    const limits = {
      hasUnlimitedGoals: canCreate && maxAllowed === -1,
      maxGoals: maxAllowed,
      hasStreakTracker: user.hasFeatureAccess("streak"),
      hasDMMessaging: user.hasFeatureAccess("dmMessaging"),
      hasPrivateRooms: user.hasFeatureAccess("privateRooms"),
      hasWeeklyMeetings: user.hasFeatureAccess("weeklyMeetings"),
      currentGoalCount: currentCount,
      canCreateMore: canCreate,
      isInTrial: user.isInTrial(),
      daysUntilTrialEnd: user.getDaysUntilTrialEnd(),
    }

    sendResponse(res, 200, true, "User limits fetched successfully", {
      limits,
    })
  },
)

/**
 * POST /api/subscription/change-plan
 * Change subscription plan
 */
export const changeSubscriptionPlan: RequestHandler = catchAsync(
  async (req, res, next) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id
    const { newPlanId, billingCycle = "monthly" } = req.body

    if (!userId) {
      return next(createError("User not authenticated", 401))
    }

    if (!newPlanId) {
      return next(createError("New plan ID is required", 400))
    }

    // Validate the new plan ID
    const validPlans = ["basic", "pro", "elite"]
    if (!validPlans.includes(newPlanId)) {
      return next(createError("Invalid plan ID", 400))
    }

    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    // For now, just update the user's subscription tier
    // In production, this would integrate with Stripe to change the plan
    user.subscriptionTier = newPlanId as any
    user.billing_cycle = billingCycle
    await user.save()

    logger.info(
      `Plan changed for user ${userId}: ${newPlanId} (${billingCycle})`,
    )

    sendResponse(res, 200, true, "Plan changed successfully", {
      newPlan: newPlanId,
      billingCycle,
      message: "Plan updated successfully",
    })
  },
)

/**
 * POST /api/subscription/cancel
 * Cancel the current subscription
 */
export const cancelUserSubscription: RequestHandler = catchAsync(
  async (req, res, next) => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    if (!userId) {
      return next(createError("User not authenticated", 401))
    }

    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", 404))
    }

    // Update user subscription status
    user.subscription_status = "canceled"
    user.subscriptionEndDate = new Date()
    await user.save()

    logger.info(`Subscription cancelled for user ${userId}`)

    sendResponse(res, 200, true, "Subscription cancelled successfully", {
      message:
        "Your subscription has been cancelled. You'll retain access until the end of your current billing period.",
    })
  },
)

/**
 * POST /api/subscription/webhook
 * Stripe webhook to sync subscription events
 */
export const handleStripeWebhook: RequestHandler = catchAsync(
  async (req, res) => {
    const { type } = req.body

    logger.info(`Received Stripe webhook: ${type}`)

    // Handle different webhook events
    switch (type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        // Webhook processing logic would go here
        break
      default:
        logger.warn(`Unhandled webhook type: ${type}`)
    }

    res.status(200).json({ received: true })
  },
)

// Legacy route handlers for backward compatibility

/**
 * GET /api/subscription/current
 * Legacy route - alias to getSubscriptionStatus
 */
export const getCurrentSubscription: RequestHandler = getSubscriptionStatus

/**
 * POST /api/subscription/upgrade
 * Legacy route - alias to changeSubscriptionPlan
 */
export const upgradePlan: RequestHandler = changeSubscriptionPlan

/**
 * DELETE /api/subscription/cancel
 * Legacy route - alias to cancelUserSubscription
 */
export const cancelSubscription: RequestHandler = cancelUserSubscription
