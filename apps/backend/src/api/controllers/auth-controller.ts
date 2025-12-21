import type { RequestHandler } from "express"

import { addDays } from "date-fns"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { UserObject } from "../../types/mongoose.gen.js"
import type { RegisterBody } from "../routes/auth.js"

import { logger } from "../../utils/winston-logger.js"
import { createError } from "../middleware/errorHandler.js"
import { User } from "../models/User.js"
import { VerificationToken } from "../models/VerificationToken.js"
import AuthService from "../services/AuthService.js"
import { FileUploadService } from "../services/file-upload-service.js"
import { StreakService } from "../services/streak-service.js"
import { createStripeCustomer } from "../services/stripe-service.js"
import {
  addSendResetPasswordEmailJob,
  addSendVerificationEmailJob,
} from "../services/verification-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

//
// ─── POST /api/auth/register ─────────────────────────────────────────────────
//
const register: RequestHandler = catchAsync(async (req, res, next) => {
  // Force rebuild - Dec 21
  logger.info(`📝 Registration request received`)
  
  const { email, password, username, name, selectedPlan, billingCycle } =
    req.body as RegisterBody

  logger.info(`📝 Registration attempt for: ${email}`)

  const normalizedEmail = email.toLowerCase().trim()

  // Check for existing user
  logger.info(`🔍 Checking for existing user...`)
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username }],
  })
  if (existing) {
    return next(
      createError("A user with that email or username already exists", 400),
    )
  }
  logger.info(`✅ No existing user found`)

  logger.info(`💳 Creating Stripe customer...`)
  const stripeCustomerId = await createStripeCustomer(normalizedEmail)
  logger.info(`✅ Stripe customer created: ${stripeCustomerId}`)

  // Hash password - let the User model handle this in pre-save middleware
  logger.info(`👤 Creating user document...`)
  const user = new User({
    name,
    email: normalizedEmail,
    username,
    password,
    subscriptionTier: selectedPlan,
    subscription_status: selectedPlan === "free-trial" ? "trial" : "past_due",
    billing_cycle: billingCycle,
    ...(selectedPlan === "free-trial"
      ? {
          trial_start_date: new Date(),
          trial_end_date: addDays(new Date(), 14),
        }
      : {}),
    stripeCustomerId,
  })

  logger.info(`💾 Saving user to database...`)
  await user.save()
  logger.info(`✅ User saved successfully`)

  logger.info(
    `✅ User registered successfully: ${normalizedEmail} with plan: ${selectedPlan}`,
  )

  logger.info(`⏭️ Skipping verification email for ${user.email}`)

  req.user = user

  sendResponse(res, 201, true, "User registered successfully")

  next()
})
//
// ─── POST /api/auth/login ────────────────────────────────────────────────────
//
export const login: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password } = req.body as { email: string; password: string }

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

  req.user = user

  // Update streak
  await StreakService.logDailyCheckIn(user._id.toString())

  // 4) Send response with subscription data
  sendResponse(res, 200, true, "Login successful", {
    user: { ...userData, accessToken },
  })

  next()
})

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

  const userData: UserObject & {
    timezone: string
  } = user.toObject()

  if (userData.coverImage) {
    userData.coverImage = await FileUploadService.generateSignedUrl(
      userData.coverImage,
    )
  }

  if (userData.profileImage) {
    userData.profileImage = await FileUploadService.generateSignedUrl(
      userData.profileImage,
    )
  }

  userData.timezone = await user.getTimezone()

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

    await addSendVerificationEmailJob(user._id, user.email)

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

  // 2) Send reset password email
  await addSendResetPasswordEmailJob(user._id, user.email)

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
