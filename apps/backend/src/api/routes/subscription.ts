// src/api/routes/subscriptionRoutes.ts
import type { Router } from "express"

import express from "express"
import rateLimit from "express-rate-limit"
import { check } from "express-validator"
import z from "zod"

import * as subscriptionController from "../controllers/subscriptionController"
import { protect } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"
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
 * GET /api/subscription/plans
 * Get available subscription plans (public route)
 */
router.get("/plans", subscriptionController.getPlans)

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
 * GET /api/subscription/status
 * Get the current user's subscription status
 */
router.get("/status", protect, subscriptionController.getSubscriptionStatus)

/**
 * GET /api/subscription/limits
 * Get the current user's feature limits based on their plan
 */
router.get("/limits", protect, subscriptionController.getUserLimits)

/**
 * POST /api/subscription/change-plan
 * Change subscription plan
 */
router.post(
  "/change-plan",
  protect,
  generalLimiter,
  [
    check("newPlanId", "newPlanId is required").notEmpty(),
    check("newPlanId", "Invalid plan ID").isIn(["basic", "pro", "elite"]),
    check("billingCycle", "billingCycle must be monthly or yearly")
      .optional()
      .isIn(["monthly", "yearly"]),
  ],
  handleValidationErrors,
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
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleStripeWebhook,
)

export default router
