import type { NextFunction, Request, Response } from "express"

import { Router } from "express"
import rateLimit from "express-rate-limit"
import { check } from "express-validator"
import z from "zod"

import {
  getSubscribers,
  signupNewsletter,
  unsubscribeNewsletter,
} from "../controllers/NewsletterController"
import { protect, restrictTo } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"
import { validate } from "../middleware/validation-middleware"
import catchAsync from "../utils/catchAsync"

const router = Router()

// Rate limiter for signup (public)
const newsletterRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // 50 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many signup attempts, please try again later.",
  },
})

/**
 * POST /api/newsletter/signup
 * Subscribe to the newsletter (public)
 */
router.post(
  "/signup",
  newsletterRateLimiter,
  validate({
    bodySchema: z.object({
      email: z.email("Invalid email address").nonempty("Email is required"),
    }),
  }),
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await signupNewsletter(req, res, next)
    },
  ),
)

/**
 * GET /api/newsletter/unsubscribe
 * Unsubscribe from the newsletter via token (public)
 */
router.get(
  "/unsubscribe",
  [check("token", "Unsubscribe token is required").notEmpty()],
  handleValidationErrors,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await unsubscribeNewsletter(req, res, next)
    },
  ),
)

/**
 * GET /api/newsletter/subscribers
 * Get all subscribers (admin only)
 */
router.get(
  "/subscribers",
  protect,
  restrictTo("admin"),
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await getSubscribers(req, res, next)
    },
  ),
)

export default router
