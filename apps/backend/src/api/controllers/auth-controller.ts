import type { PRICING } from "@ab/shared/pricing"
import type { RequestHandler } from "express"
import type { AuthenticatedRequest } from "src/types/AuthenticatedRequest"
import type {
  UserObject,
  VerificationTokenDocument,
} from "src/types/mongoose.gen"

import {
  getResetPasswordTemplate,
  getVerifyEmailTemplate,
} from "@ab/transactional"

import appConfig from "../../config/appConfig"
import { logger } from "../../utils/winstonLogger"
import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"
import { VerificationToken } from "../models/VerificationToken"
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
const register: RequestHandler = catchAsync(async (req, res, next) => {
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
const getCurrentUser: RequestHandler = catchAsync(async (req, res, next) => {
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
})

// ─── POST /api/auth/send-verification-email ────────────────────────────────
const sendVerificationEmail: RequestHandler = catchAsync(
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
    const existingTokenDoc = await VerificationToken.findOne({
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
      : await VerificationToken.generate(user._id)

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
const verifyEmail: RequestHandler = catchAsync(async (req, res, next) => {
  const token = (req.query.token as string).trim()

  const tokenDoc = await VerificationToken.findValid(token)
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
})

// --- POST /api/auth/forget-password ───────────────────────────────────────
const forgetPassword: RequestHandler = catchAsync(async (req, res) => {
  const { email } = req.body as { email: string }

  // 1) Find user by email
  const user = await User.findOne({ email })
  // To prevent user enumeration, always respond with success even if user doesn't exist
  if (!user) {
    sendResponse(
      res,
      200,
      true,
      "You will receive an email if your account exists",
    )
    return
  }

  // 2) Generate password reset token
  // Invalidate any and all existing reset tokens FIRST
  await VerificationToken.deleteMany({ user: user._id })
  const resetTokenDoc: VerificationTokenDocument =
    await VerificationToken.generate(user._id, 15 * 60)

  // 3) Send email with reset link
  const resetUrl = `${appConfig.frontendUrl}/reset-password/${resetTokenDoc.token}`
  logger.debug(`Password reset URL: ${resetUrl}`)
  const { html, text } = await getResetPasswordTemplate(
    resetUrl,
    `${appConfig.frontendUrl}/logo.png`,
  )

  await sendHtmlEmail(
    user.email,
    "Accountability Buddy — Reset your password",
    html,
    text,
  )

  sendResponse(
    res,
    200,
    true,
    "You will receive an email if your account exists",
  )
})

// --- POST /api/auth/reset-password ----------------------------------------
const resetPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { token, password } = req.body as {
    token: string
    password: string
  }

  const tokenDoc = await VerificationToken.findValid(token)
  if (!tokenDoc) {
    return next(createError("Invalid or expired token", 400))
  }

  const user = await User.findById(tokenDoc.user)
  if (!user) {
    return next(createError("User not found", 404))
  }

  user.password = password // will be hashed by pre save hook
  user.isVerified = true // Mark as verified after password reset
  await user.save()
  await tokenDoc.deleteOne()

  sendResponse(res, 200, true, "Password reset successfully", {
    email: user.email,
  })
})

export default {
  register,
  login,
  getCurrentUser,
  sendVerificationEmail,
  verifyEmail,
  forgetPassword,
  resetPassword,
}
