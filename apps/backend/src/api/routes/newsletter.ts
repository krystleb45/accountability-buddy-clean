import { Router } from "express"
import rateLimit from "express-rate-limit"
import z from "zod"

import validate from "../middleware/validation-middleware.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

const router = Router()

// Rate limit newsletter signups
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Too many signup attempts. Please try again later." },
})

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
})

/**
 * POST /api/newsletter/signup
 * Subscribe email to Mailchimp newsletter
 */
router.post(
  "/signup",
  newsletterLimiter,
  validate({ bodySchema: signupSchema }),
  catchAsync(async (req, res) => {
    const { email } = req.body

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
      console.error("Mailchimp environment variables not configured")
      return sendResponse(res, 500, false, "Newsletter service unavailable")
    }

    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email.toLowerCase(),
          status: "subscribed",
          tags: ["website-signup"],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        return sendResponse(res, 200, true, "Successfully subscribed to newsletter!")
      }

      // Handle already subscribed
      if (data.title === "Member Exists") {
        return sendResponse(res, 200, true, "Already subscribed to newsletter!")
      }

      // Handle other errors
      console.error("Mailchimp error:", data)
      return sendResponse(res, 400, false, data.detail || "Failed to subscribe")
    } catch (error) {
      console.error("Newsletter signup error:", error)
      return sendResponse(res, 500, false, "Failed to subscribe to newsletter")
    }
  }),
)

export default router