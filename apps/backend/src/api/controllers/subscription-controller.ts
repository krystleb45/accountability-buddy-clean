import type { NextFunction, Request, RequestHandler, Response } from "express"
import type Stripe from "stripe"

import status from "http-status"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type {
  ChangePlanBody,
  CreateCheckoutSessionBody,
} from "../routes/subscription.js"

import { logger } from "../../utils/winston-logger.js"
import { createError } from "../middleware/errorHandler.js"
import { User } from "../models/User.js"
import { GoalService } from "../services/goal-service.js"
import {
  handleCheckoutCompleted,
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
  stripe,
} from "../services/stripe-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

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
      customer: user?.stripeCustomerId,
      ...(user.stripeCustomerId ? {} : { customer_email: user.email }),
      mode: "subscription",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}?canceled=true`,
    })

    if (session.customer) {
      user.stripeCustomerId = session.customer.toString()
      await user.save()
    }

    sendResponse(res, 200, true, "Checkout session created", {
      sessionUrl: session.url,
      sessionId: session.id,
      planId,
      billingCycle,
    })
  },
)

/**
 * POST /api/subscription/portal-session
 * Create a Stripe billing portal session
 */
export const createBillingPortalSession: RequestHandler = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, { returnUrl: string }>,
    res,
    next,
  ) => {
    const userId = req.user.id
    const { returnUrl } = req.body

    const user = await User.findById(userId)

    if (!user.stripeCustomerId) {
      return next(createError("No Stripe customer ID found", 400))
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    })

    sendResponse(res, 200, true, "Billing portal session created", {
      sessionUrl: session.url,
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
      hasAdvancedAnalytics: user.hasFeatureAccess("analytics"),
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
  async (
    req: AuthenticatedRequest<unknown, unknown, ChangePlanBody>,
    res,
    next,
  ) => {
    const userId = req.user.id
    const { newPlanId, billingCycle } = req.body

    const user = await User.findById(userId)

    const currentSubscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
    )

    const currentSubscriptionItemId = currentSubscription.items.data[0].id
    const prices = await stripe.prices.list({
      lookup_keys: [`${newPlanId}_${billingCycle}`],
      expand: ["data.product"],
      limit: 1,
    })
    const newPriceId = prices.data[0].id

    if (!currentSubscriptionItemId) {
      return next(createError("No active subscription to change", 400))
    }

    if (!newPriceId) {
      return next(createError("Invalid plan ID", 400))
    }

    // Update the subscription with the new price
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [
        {
          id: currentSubscriptionItemId,
          deleted: true,
        },
        {
          price: newPriceId,
          quantity: 1,
        },
      ],
      cancel_at_period_end: false,
    })

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
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id

    const user = await User.findById(userId)

    const subscriptionId = user.stripeSubscriptionId
    if (!subscriptionId) {
      return next(createError("No active subscription to cancel", 400))
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update user subscription status
    user.subscription_status = "canceled"
    user.subscriptionEndDate = user.next_billing_date
    user.next_billing_date = undefined
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
export const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if webhook signing is configured.
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    // Retrieve the event by verifying the signature using the raw body and secret.
    let event: Stripe.Event | undefined
    const signature = req.headers["stripe-signature"]

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      )
    } catch (err) {
      logger.error("❌ Webhook signature verification failed.", err.message)
      next(
        createError(
          "Webhook signature verification failed",
          status.BAD_REQUEST,
          err,
        ),
      )
      return
    }
    // Extract the object from the event.
    const eventType = event.type

    // Handle different webhook events
    switch (eventType) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object) // does not change status; only adds subscription info
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object) // does not change status; only updates subscription info
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object) // changes status to canceled or expired
        break
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object) // changes status to active
        break
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object) // changes status to past_due
        break
      default:
        logger.warn(`Unhandled webhook type: ${eventType}`)
    }

    sendResponse(res, 200, true, "Webhook received successfully")
  },
)
