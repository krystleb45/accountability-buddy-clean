import type { NextFunction, Request, Response } from "express"

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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    if (!userId) {
      return next(createError("User not authenticated", status.UNAUTHORIZED))
    }

    // Fetch the user from the database
    const user = await User.findById(userId)
    if (!user) {
      return next(createError("User not found", status.NOT_FOUND))
    }

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
      const daysLeft = user.getDaysUntilTrialEnd()
      sendResponse(
        res,
        status.FORBIDDEN,
        false,
        daysLeft > 0
          ? `Your trial expires in ${daysLeft} days. Please upgrade to continue.`
          : "Your subscription has expired or the free trial has ended. Please renew your subscription.",
      )
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
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest
      const userId = authReq.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        })
        return
      }

      const user = await User.findById(userId)
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        })
        return
      }

      // Check if subscription is active first
      const validStatuses = ["active", "trial", "trialing"]
      if (!validStatuses.includes(user.subscription_status)) {
        res.status(403).json({
          success: false,
          message: "Active subscription required to access this feature",
          upgradeRequired: true,
        })
        return
      }

      // Check specific feature access
      const hasAccess = user.hasFeatureAccess(requiredFeature)

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: `This feature requires a higher subscription plan. Your current plan: ${user.subscriptionTier}`,
          requiredFeature,
          currentPlan: user.subscriptionTier,
          upgradeRequired: true,
        })
        return
      }

      logger.info(
        `✅ Feature access validated for user ${userId}, feature: ${requiredFeature}`,
      )
      next()
    } catch (error) {
      logger.error(
        `❌ Error validating feature access for ${requiredFeature}:`,
        error,
      )
      res.status(500).json({
        success: false,
        message: "Server error during feature validation",
      })
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
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest
      const userId = authReq.user?.id

      if (!userId) {
        next()
        return
      }

      const user = await User.findById(userId)
      if (!user || !user.isInTrial()) {
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
