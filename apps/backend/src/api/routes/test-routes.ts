import { Router } from "express"
import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import { protect } from "../middleware/auth-middleware.js"
import { sendSMS, isSMSEnabled } from "../services/sms-service.js"
import sendResponse from "../utils/sendResponse.js"
import catchAsync from "../utils/catchAsync.js"

const router = Router()

/**
 * GET /api/test/sms-status
 * Check if SMS service is configured
 */
router.get("/sms-status", protect, catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const enabled = isSMSEnabled()
    
    sendResponse(res, 200, true, "SMS status checked", {
      smsEnabled: enabled,
      twilioConfigured: enabled,
      message: enabled 
        ? "Twilio is configured and ready to send SMS" 
        : "Twilio is NOT configured - check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER env vars"
    })
  }
))

/**
 * POST /api/test/send-sms
 * Send a test SMS to the authenticated user
 * Body: { phoneNumber: "+1234567890" } (optional - uses user's phone if not provided)
 */
router.post("/send-sms", protect, catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { phoneNumber } = req.body
    
    if (!isSMSEnabled()) {
      return sendResponse(res, 400, false, "SMS service is not configured", {
        error: "Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER env vars"
      })
    }

    if (!phoneNumber) {
      return sendResponse(res, 400, false, "Phone number is required", {
        error: "Provide phoneNumber in request body"
      })
    }

    const success = await sendSMS({
      to: phoneNumber,
      body: "🎯 Accountability Buddy Test\n\nIf you're reading this, SMS is working! 🎉\n\nKeep crushing your goals! 💪"
    })

    if (success) {
      sendResponse(res, 200, true, "Test SMS sent successfully!", {
        phoneNumber,
        sent: true
      })
    } else {
      sendResponse(res, 500, false, "Failed to send SMS", {
        phoneNumber,
        sent: false,
        error: "Check server logs for details"
      })
    }
  }
))

export default router