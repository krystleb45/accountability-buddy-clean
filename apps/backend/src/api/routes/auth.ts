import { PRICING } from "@ab/shared/pricing"
import { Router } from "express"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import z from "zod"

import authController from "../controllers/auth-controller"
import { protect } from "../middleware/auth-middleware"
import validate from "../middleware/validation-middleware"
import catchAsync from "../utils/catchAsync"

const router = Router()

// ─── limit login/register to 10 per 15min ─────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
})

// ─── POST /api/auth/register ─────────────────────────────────────────────-
router.post(
  "/register",
  authLimiter,
  validate({
    bodySchema: z.object({
      email: z.email("Email must be valid"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      username: z.string().nonempty("Username is required"),
      name: z.string().min(2),
      selectedPlan: z.enum(PRICING.map((plan) => plan.id)),
      billingCycle: z.enum(["monthly", "yearly"]).default("yearly"),
    }),
  }),
  catchAsync(async (req, res, next) => {
    await authController.register(req, res, next)
  }),
)

// ─── POST /api/auth/login ────────────────────────────────────────────────-
router.post(
  "/login",
  authLimiter,
  validate({
    bodySchema: z.object({
      email: z.email("Email must be valid").trim().toLowerCase(),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  }),
  catchAsync(async (req, res, next) => {
    await authController.login(req, res, next)
  }),
)

// ─── GET /api/auth/me ────────────────────────────────────────────────────-
router.get(
  "/me",
  protect,
  catchAsync(async (req, res, next) => {
    await authController.getCurrentUser(req, res, next)
  }),
)

// --- Multi-window rate limits for verification and password reset emails ---
//   - Cooldown: 1 per 60s per user
//   - Burst: 3 per 15min per user
//   - Hourly: 5 per hour per user
//   - Daily: 10 per day per user
//   - Per IP safety valve: 20 per hour

const verificationCooldown = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    ((req as any).user?.id as string) || ipKeyGenerator(req.ip) || "anon",
  message:
    "Please wait 60 seconds before requesting another verification email.",
})

const verificationBurst = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    ((req as any).user?.id as string) || ipKeyGenerator(req.ip) || "anon",
  message: {
    message: "Too many requests in a short period. Try again in 15 minutes.",
  },
})

const verificationHourly = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    ((req as any).user?.id as string) || ipKeyGenerator(req.ip) || "anon",
  message: { message: "Hourly limit reached. Please try again later." },
})

const verificationDaily = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    ((req as any).user?.id as string) || ipKeyGenerator(req.ip) || "anon",
  message: {
    message:
      "Daily verification email limit reached. Please try again tomorrow.",
  },
})

const verificationPerIp = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP. Please try again later.",
  },
})

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 * /api/auth/send-verification-email:
 *   post:
 *     summary: Send a verification email
 *     description: Sends a verification email to the user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/send-verification-email",
  // IP-level limiter first to stop broad abuse
  verificationPerIp,
  // Require auth, then apply per-user windows
  protect,
  verificationCooldown,
  verificationBurst,
  verificationHourly,
  verificationDaily,
  catchAsync(async (req, res, next) => {
    await authController.sendVerificationEmail(req, res, next)
  }),
)

// --- GET /api/auth/verify-email -------------------------------------------
router.get(
  "/verify-email",
  protect,
  validate({
    querySchema: z.object({
      token: z.string().nonempty("Token is required"),
    }),
  }),
  catchAsync(async (req, res, next) => {
    await authController.verifyEmail(req, res, next)
  }),
)

// --- POST /api/auth/forget-password ---------------------------------------
// Multi-window, defense-in-depth rate limits
// 1) Per-IP safety: cooldown + burst + hourly + daily
const fpIpCooldown = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Please wait before requesting another password reset." },
})

const fpIpBurst = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset requests. Try again in 15 minutes.",
  },
})

const fpIpHourly = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Hourly limit reached. Please try again later." },
})

const fpIpDaily = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Daily limit reached. Please try again tomorrow." },
})

// 2) Per-identifier limits (email when provided, else fall back to IP)
function emailKey(req: any): string {
  const raw = req?.body?.email
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase()

    if (normalized) {
      return normalized
    }
  }
  // Fallback to IP if email not present/invalid
  return ipKeyGenerator((req as any).ip) || "anon"
}

const fpEmailCooldown = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKey,
  message: { message: "Please wait before requesting another password reset." },
})

const fpEmailBurst = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKey,
  message: {
    message: "Too many password reset requests. Try again in 15 minutes.",
  },
})

const fpEmailHourly = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKey,
  message: { message: "Hourly limit reached. Please try again later." },
})

const fpEmailDaily = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKey,
  message: { message: "Daily limit reached. Please try again tomorrow." },
})

router.post(
  "/forget-password",
  // IP-level guardrails first to blunt broad abuse regardless of payload
  fpIpDaily,
  fpIpHourly,
  fpIpBurst,
  fpIpCooldown,
  validate({
    bodySchema: z.object({
      email: z
        .email("Invalid email")
        .nonempty("Email is required")
        .toLowerCase()
        .trim(),
    }),
  }),
  // After validation, enforce per-email ceilings
  fpEmailDaily,
  fpEmailHourly,
  fpEmailBurst,
  fpEmailCooldown,
  catchAsync(async (req, res, next) => {
    await authController.forgetPassword(req, res, next)
  }),
)

// --- POST /api/auth/reset-password ----------------------------------------
router.post(
  "/reset-password",
  validate({
    bodySchema: z.object({
      token: z.string().nonempty("Token is required"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    }),
  }),
  catchAsync(async (req, res, next) => {
    await authController.resetPassword(req, res, next)
  }),
)

export default router
