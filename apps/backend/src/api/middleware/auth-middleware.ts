import type { RequestHandler } from "express"
import type { UserObject } from "src/types/mongoose.gen"

import jwt from "jsonwebtoken"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"

import { logger } from "../../utils/winstonLogger"
import { User } from "../models/User"
import catchAsync from "../utils/catchAsync"
import { createError } from "./errorHandler"

interface JwtPayload {
  userId?: string
  _id?: string // Support both formats
  role: string
  email?: string
  username?: string
}

/**
 * Protects routes by verifying Bearer JWT tokens from Authorization header
 */
export const protect: RequestHandler = catchAsync(async (req, _res, next) => {
  // Extract token from Authorization header ONLY
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    logger.warn("❌ No Bearer token in Authorization header")
    return next(createError("Unauthorized: No token provided", 401))
  }

  const token = authHeader.slice(7).trim()

  if (!token) {
    logger.warn("❌ Empty token after Bearer prefix")
    return next(createError("Unauthorized: No token provided", 401))
  }

  // Get JWT secret from environment
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET
  if (!secret) {
    logger.error("❌ ACCESS_TOKEN_SECRET/JWT_SECRET not configured")
    return next(createError("Server misconfiguration", 500))
  }

  // Verify JWT token
  let decoded: JwtPayload
  try {
    decoded = jwt.verify(token, secret) as JwtPayload
  } catch (err: any) {
    logger.warn(`❌ Invalid token: ${err.message}`)
    return next(createError("Unauthorized: Invalid token", 401))
  }

  // Get user ID from token (support both formats)
  const userIdFromToken = decoded.userId || decoded._id

  if (!userIdFromToken) {
    logger.warn("❌ No user ID found in token")
    return next(createError("Unauthorized: Invalid token format", 401))
  }

  // Load user from database
  const userDoc = await User.findById(userIdFromToken).select("-password")

  if (!userDoc) {
    logger.warn(`❌ User not found: ${userIdFromToken}`)
    return next(createError("Unauthorized: User not found", 401))
  }

  // Map subscription status to expected format
  const mapSubscriptionStatus = (
    status: string,
  ): "active" | "trial" | "expired" => {
    switch (status) {
      case "active":
        return "active"
      case "trial":
        return "trial"
      case "canceled":
      case "past_due":
      case "expired":
      default:
        return "expired"
    }
  }

  const user: UserObject = userDoc.toObject()

  // Attach user to request object
  ;(req as AuthenticatedRequest).user = {
    ...user,
    subscription_status: mapSubscriptionStatus(user.subscription_status),
    id: user._id.toString(),
  }

  next()
})

/**
 * Restricts access to specific roles
 */
export function restrictTo(
  ...roles: ("admin" | "moderator" | "military" | "user")[]
): RequestHandler {
  return (req, _res, next) => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.user) {
      logger.warn("❌ No user attached to request in restrictTo")
      return next(createError("Unauthorized: No user attached", 401))
    }

    if (!roles.includes(authReq.user.role)) {
      logger.warn(
        `❌ Access denied for ${authReq.user.email}. Has role: ${authReq.user.role}, requires one of: ${roles.join(", ")}`,
      )
      return next(
        createError("Forbidden: You don't have the required role", 403),
      )
    }

    logger.info(
      `✅ Role check passed for ${authReq.user.email}: ${authReq.user.role}`,
    )
    next()
  }
}

/**
 * Military-only access
 */
export const militaryAuth: RequestHandler = catchAsync(
  async (req, _res, next) => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.user) {
      return next(createError("Unauthorized: No user attached", 401))
    }

    if (authReq.user.role !== "military") {
      logger.warn(`🔒 Military-only access attempted by ${authReq.user.email}`)
      return next(
        createError("Forbidden: Access restricted to military members", 403),
      )
    }

    next()
  },
)
