import type { PRICING } from "@ab/shared/pricing"
import type { RequestHandler } from "express"
import type { AuthenticatedRequest } from "src/types/AuthenticatedRequest"
import type { UserObject } from "src/types/mongoose.gen"

import { getVerifyEmailTemplate } from "@ab/transactional"

import appConfig from "../../config/appConfig"
import { logger } from "../../utils/winstonLogger"
import { createError } from "../middleware/errorHandler"
import EmailVerificationToken from "../models/EmailVerificationToken"
import { User } from "../models/User"
import AuthService from "../services/AuthService"
import { sendHtmlEmail } from "../services/emailService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

interface RegisterRequestBody {
  email: string
  password: string
  username: string
  name: string
  selectedPlan: (typeof PRICING)[number]["id"]
  billingCycle: "monthly" | "yearly"
}

//
// ─── POST /api/auth/register ─────────────────────────────────────────────────
//
export const register: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password, username, name, selectedPlan, billingCycle } =
    req.body as RegisterRequestBody

  const normalizedEmail = email.toLowerCase().trim()

  // Check for existing user
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username }],
  })
  if (existing) {
    return next(
      createError("A user with that email or username already exists", 400),
    )
  }

  // Hash password - let the User model handle this in pre-save middleware
  const user = new User({
    name,
    email: normalizedEmail,
    username,
    password, // Will be hashed by pre-save middleware
    subscriptionTier: selectedPlan as any,
    subscription_status: selectedPlan === "free-trial" ? "trial" : "active",
    billing_cycle: billingCycle,
    trial_start_date: new Date(),
    // trial_end_date is set by default in the schema (14 days from now)
  })

  await user.save()

  logger.info(
    `✅ User registered successfully: ${normalizedEmail} with plan: ${selectedPlan}`,
  )

  // Return success response with token and user data
  sendResponse(res, 201, true, "User registered successfully")
})

//
// ─── POST /api/auth/login ────────────────────────────────────────────────────
//
export async function login(req, res, next) {
  const { email, password } = req.body as { email: string; password: string }

  logger.debug("→ [login] received payload:", { email })

  // 1) Lookup user
  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    return next(createError("Invalid credentials", 401))
  }

  // 2) Compare passwords
  const isMatch = await AuthService.comparePassword(password, user.password!)
  if (!isMatch) {
    return next(createError("Invalid credentials", 401))
  }

  // 3) Issue tokens
  const accessToken = await AuthService.generateToken({
    _id: user._id.toString(),
    role: user.role,
  })

  const userData: UserObject = user.toObject()

  // 4) Send response with subscription data
  sendResponse(res, 200, true, "Login successful", {
    user: { ...userData, accessToken },
  })
}

//
// ─── GET /api/auth/me ────────────────────────────────────────────────────────
//
export const getCurrentUser: RequestHandler = catchAsync(
  async (req, res, next) => {
    const userId = (req as AuthenticatedRequest).user!.id

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return next(createError("User not found", 404))
    }

    // Check if trial has expired and update status
    if (
      user.isInTrial() &&
      user.trial_end_date &&
      new Date() > user.trial_end_date
    ) {
      user.subscription_status = "expired"
      await user.save()
    }

    const userData: UserObject = user.toObject()

    sendResponse(res, 200, true, "User fetched successfully", {
      user: userData,
    })
  },
)

// ─── POST /api/auth/send-verification-email ────────────────────────────────
export const sendVerificationEmail: RequestHandler = catchAsync(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (user.isVerified) {
      sendResponse(res, 200, true, "Email already verified", {})
      return
    }

    const reuseWindowMs = 15 * 60 * 1000 // 15 minutes
    const now = Date.now()

    // Try reusing most recent, unexpired token within reuse window
    const existingTokenDoc = await EmailVerificationToken.findOne({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .exec()

    const canReuse =
      existingTokenDoc &&
      !existingTokenDoc.isExpired() &&
      now - existingTokenDoc.createdAt.getTime() < reuseWindowMs

    const tokenDoc = canReuse
      ? existingTokenDoc
      : await EmailVerificationToken.generate(user._id)

    const frontendUrl = appConfig.frontendUrl.replace(/\/$/, "")
    const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(tokenDoc.token)}`

    const { html, text } = await getVerifyEmailTemplate(
      verifyUrl,
      `${appConfig.frontendUrl}/logo.png`,
    )

    logger.debug(`Verification URL: ${verifyUrl}`)

    await sendHtmlEmail(
      user.email,
      "Accountability Buddy — Verify your email",
      html,
      text,
    )

    sendResponse(res, 200, true, "Verification email sent", {})
  },
)

// ─── GET /api/auth/verify-email ───────────────────────────────────────────
export const verifyEmail: RequestHandler = catchAsync(
  async (req, res, next) => {
    const token = (req.query.token as string).trim()

    const tokenDoc = await EmailVerificationToken.findValid(token)
    if (!tokenDoc) {
      return next(createError("Invalid or expired token", 400))
    }

    const user = await User.findById(tokenDoc.user)
    if (!user) {
      return next(createError("User not found", 404))
    }

    if (!user.isVerified) {
      user.isVerified = true
      await user.save()
    }

    await tokenDoc.deleteOne()

    sendResponse(res, 200, true, "Email verified successfully")
  },
)

export default {
  register,
  login,
  getCurrentUser,
  sendVerificationEmail,
  verifyEmail,
}
