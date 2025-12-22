import { Router } from "express"
import rateLimit from "express-rate-limit"

import { sendHtmlEmail } from "../services/email-service.js"
import sendResponse from "../utils/sendResponse.js"
import catchAsync from "../utils/catchAsync.js"

const router = Router()

// 5 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many contact requests, please try again later.",
  },
})

router.post(
  "/",
  contactLimiter,
  catchAsync(async (req, res) => {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return sendResponse(res, 400, false, "Name, email, and message are required")
    }

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || "info@accountabilitybuddys.com"
    
    const html = `
      <h2>New Contact Support Message</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `

    const text = `
      New Contact Support Message
      From: ${name}
      Email: ${email}
      Message: ${message}
    `

    await sendHtmlEmail(
      supportEmail,
      `Contact Support: Message from ${name}`,
      html,
      text
    )

    sendResponse(res, 200, true, "Message sent successfully")
  })
)

export default router