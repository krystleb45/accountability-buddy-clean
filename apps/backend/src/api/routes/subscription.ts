import type { Router } from "express"

import express from "express"
import rateLimit from "express-rate-limit"
import z from "zod"

import * as subscriptionController from "../controllers/subscription-controller"
import { protect } from "../middleware/auth-middleware"
import { validate } from "../middleware/validation-middleware"

const router: Router = express.Router()

// Rate limiters
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
})

/**
 * POST /api/subscription/create-session
 * Create a checkout session for subscription
 */

const bodySchema = z.object({
  planId: z.enum(["free-trial", "basic", "pro", "elite"]),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
  successUrl: z.url().optional(),
  cancelUrl: z.url().optional(),
})
export type CreateCheckoutSessionBody = z.infer<typeof bodySchema>

router.post(
  "/create-session",
  protect,
  createLimiter,
  validate({
    bodySchema,
  }),
  subscriptionController.createCheckoutSession,
)

/**
 * POST /api/subscription/portal-session
 * Create a billing portal session
 */
router.post(
  "/portal-session",
  protect,
  generalLimiter,
  validate({
    bodySchema: z.object({
      returnUrl: z.url(),
    }),
  }),
  subscriptionController.createBillingPortalSession,
)

/**
 * GET /api/subscription/limits
 * Get the current user's feature limits based on their plan
 */
router.get("/limits", protect, subscriptionController.getUserLimits)

/**
 * POST /api/subscription/change-plan
 * Change subscription plan
 */
const changePlanBodySchema = z.object({
  newPlanId: z.enum(["basic", "pro", "elite"]),
  billingCycle: z.enum(["monthly", "yearly"]),
})
export type ChangePlanBody = z.infer<typeof changePlanBodySchema>

router.post(
  "/change-plan",
  protect,
  generalLimiter,
  validate({
    bodySchema: changePlanBodySchema,
  }),
  subscriptionController.changeSubscriptionPlan,
)

/**
 * POST /api/subscription/cancel
 * Cancel the current subscription
 */
router.post(
  "/cancel",
  protect,
  generalLimiter,
  subscriptionController.cancelUserSubscription,
)

/**
 * POST /api/subscription/webhook
 * Stripe webhook to sync subscription events
 */
router.post("/webhook", subscriptionController.handleStripeWebhook)

export default router
