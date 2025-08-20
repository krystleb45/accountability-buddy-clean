// src/api/routes/email.ts
import { Router } from "express"
import rateLimit from "express-rate-limit"
import { check } from "express-validator"

import * as emailController from "../controllers/emailController"
import { protect } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"

const router = Router()

// Throttle email sends to 5 per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many email requests, please try again later.",
  },
})

/**
 * POST /api/email/send
 * Protected + rate-limited + body validation
 */
router.post(
  "/send",
  // 1) Require a valid JWT
  protect,
  // 2) Throttle repeated requests
  limiter,
  // 3) Validate required email fields
  [
    check("to", "A valid recipient email is required").isEmail(),
    check("subject", "Subject is required").notEmpty(),
    check("body", "Email body is required").notEmpty(),
  ],
  // 4) Return 400 if any checks failed
  handleValidationErrors,
  // 5) Forward to your catchAsync-wrapped controller
  emailController.sendEmail,
)

export default router
