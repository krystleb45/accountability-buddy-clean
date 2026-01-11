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
  console.log("🔥 REGISTER ENDPOINT HIT")
  console.log("Request body:", JSON.stringify(req.body))

  const { email, password, username, name, selectedPlan, billingCycle } =
    req.body as RegisterBody

  const normalizedEmail = email.toLowerCase().trim()

  console.log("🔍 Step 1: Checking for existing user...")
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username }],
  })
  if (existing) {
    return next(
      createError("A user with that email or username already exists", 400),
    )
  }
  console.log("✅ Step 1 complete: No existing user")

  console.log("💳 Step 2: Creating Stripe customer...")
  let stripeCustomerId: string
  try {
    stripeCustomerId = await createStripeCustomer(normalizedEmail)
    console.log(
      "✅ Step 2 complete: Stripe customer created:",
      stripeCustomerId,
    )
  } catch (stripeError) {
    console.log("❌ STRIPE ERROR:", stripeError)
    throw stripeError
  }
  console.log("👤 Step 3: Creating user document...")
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
          trial_end_date: addDays(new Date(), 7),
        }
      : {}),
    stripeCustomerId,
  })
  console.log("✅ Step 3 complete: User document created")

  console.log("💾 Step 4: Saving user to database...")
  await user.save()
  console.log("✅ Step 4 complete: User saved")

  await addSendVerificationEmailJob(user._id, user.email)
  console.log("📧 Verification email queued for", user.email)

  req.user = user

  console.log("📤 Step 5: Sending response...")
  sendResponse(res, 201, true, "User registered successfully")

  next()
})

//
// ─── POST /api/auth/login ────────────────────────────────────────────────────
//
export const login: RequestHandler = catchAsync(async (req, res, next) => {
  console.log("🔐 LOGIN ATTEMPT")
  const { email, password } = req.body as { email: string; password: string }
  console.log("🔐 Email:", email)

  // 1) Lookup user
  console.log("🔍 Looking up user...")
  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    console.log("❌ User not found")
    return next(createError("Invalid credentials", 401))
  }
  console.log("✅ User found:", user.email)

  // 2) Compare passwords
  console.log("🔑 Comparing passwords...")
  const isMatch = await AuthService.comparePassword(password, user.password!)
  if (!isMatch) {
    console.log("❌ Password mismatch")
    return next(createError("Invalid credentials", 401))
  }
  console.log("✅ Password correct")

  // 3) Issue tokens
  console.log("🎫 Generating token...")
let accessToken: string
try {
  accessToken = await AuthService.generateToken({
    _id: user._id.toString(),
    role: user.role,
  })
  console.log("✅ Token generated")
} catch (tokenError) {
  console.log("❌ TOKEN ERROR:", tokenError)
  throw tokenError
}

  const userData: UserObject = user.toObject()

  req.user = user

  // Update streak
  console.log("📊 Updating streak...")
  await StreakService.logDailyCheckIn(user._id.toString())
  console.log("✅ Streak updated")

  // 4) Send response with subscription data
  console.log("📤 Sending response...")
  sendResponse(res, 200, true, "Login successful", {
    user: { ...userData, accessToken },
  })


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
