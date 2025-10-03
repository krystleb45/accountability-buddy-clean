import type { RequestHandler } from "express"
import type { AuthenticatedRequest } from "src/types/authenticated-request.type"
import type { UserObject } from "src/types/mongoose.gen"

import { addDays } from "date-fns"

import type { RegisterBody } from "../routes/auth"

import { logger } from "../../utils/winstonLogger"
import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"
import { VerificationToken } from "../models/VerificationToken"
import AuthService from "../services/AuthService"
import { FileUploadService } from "../services/file-upload-service"
import { StreakService } from "../services/streak-service"
import {
  addSendResetPasswordEmailJob,
  addSendVerificationEmailJob,
} from "../services/verification-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

//
// ─── POST /api/auth/register ─────────────────────────────────────────────────
//
const register: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password, username, name, selectedPlan, billingCycle } =
    req.body as RegisterBody

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
    subscriptionTier: selectedPlan,
    subscription_status: selectedPlan === "free-trial" ? "trial" : "past_due",
    billing_cycle: billingCycle,
    ...(selectedPlan === "free-trial"
      ? {
          trial_start_date: new Date(),
          trial_end_date: addDays(new Date(), 14),
        }
      : {}),
  })

  await user.save()

  logger.info(
    `✅ User registered successfully: ${normalizedEmail} with plan: ${selectedPlan}`,
  )

  await addSendVerificationEmailJob(user._id, user.email)

  req.user = user

  // Return success response with token and user data
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
