import type { NextFunction, Response } from "express"

import { isAfter } from "date-fns"
import status from "http-status"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"

import { logger } from "../../utils/winstonLogger"
import { User } from "../models/User"
import sendResponse from "../utils/sendResponse"
import { createError } from "./errorHandler"

/**
 * Middleware to validate subscription status
 * Works with your User model that stores subscription data directly on the user
 */
export async function validateSubscription(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user.id

    // Fetch the user from the database
    const user = await User.findById(userId)

    // Check if trial has expired and update status
    if (
      user.isInTrial() &&
      user.trial_end_date &&
      isAfter(new Date(), user.trial_end_date)
    ) {
      user.subscription_status = "expired"
      await user.save()
      logger.info(`Trial expired for user ${userId}`)
    }

    const hasValidSubscription = user.isSubscriptionActive()

    if (!hasValidSubscription) {
      const subscriptionStatus = user.subscription_status

      const message =
        subscriptionStatus === "expired"
          ? "Your subscription has expired. Please renew your subscription."
          : subscriptionStatus === "past_due"
            ? "Your subscription payment is past due. Please pay your invoice to continue."
            : "Your subscription is inactive. Please contact support."

      sendResponse(res, status.FORBIDDEN, false, message)
      return
    }

    // If everything is valid, proceed to next middleware
    logger.debug(
      `✅ Subscription validation passed for user ${userId} (${user.subscriptionTier})`,
    )
    next()
  } catch (error) {
    logger.error("❌ Error in subscription validation middleware:", error)
    next(
      createError(
        "Server error during subscription validation",
        status.INTERNAL_SERVER_ERROR,
      ),
    )
  }
}

/**
 * Middleware to validate specific feature access
 * Use this for routes that require specific subscription features
 */
export function validateFeatureAccess(requiredFeature: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user.id

      const user = await User.findById(userId)

      // Check specific feature access
      const hasAccess = user.hasFeatureAccess(requiredFeature)

      if (!hasAccess) {
        sendResponse(
          res,
          403,
          false,
          `This feature requires a higher subscription plan. Your current plan: ${user.subscriptionTier}`,
          {
            requiredFeature,
            currentPlan: user.subscriptionTier,
            upgradeRequired: true,
          },
        )
        return
      }

      logger.debug(
        `✅ Feature access validated for user ${userId}, feature: ${requiredFeature}`,
      )
      next()
    } catch (error) {
      logger.error(
        `❌ Error validating feature access for ${requiredFeature}:`,
        error,
      )
      next(
        createError(
          "Server error during feature access validation",
          status.INTERNAL_SERVER_ERROR,
        ),
      )
    }
  }
}

/**
 * Middleware for trial users - shows upgrade prompts but allows access
 *
 * Use this for features you want to encourage upgrades for
 */
export function trialPrompt(featureName: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user.id

      const user = await User.findById(userId)
      if (!user.isInTrial()) {
        next()
        return
      }

      // Add trial info to response headers for frontend to display upgrade prompts
      res.setHeader("X-Trial-User", "true")
      res.setHeader("X-Trial-Feature", featureName)
      res.setHeader("X-Days-Left", user.getDaysUntilTrialEnd().toString())

      next()
    } catch (error) {
      logger.error("❌ Error in trial prompt middleware:", error)
      next() // Don't block the request on error
    }
  }
}
