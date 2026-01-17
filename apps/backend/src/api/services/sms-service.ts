import twilio from "twilio"

import { logger } from "../../utils/winston-logger.js"

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

let client: twilio.Twilio | null = null

// Only initialize if credentials are present
if (accountSid && authToken && twilioPhoneNumber) {
  client = twilio(accountSid, authToken)
  logger.info("📱 Twilio SMS service initialized")
} else {
  logger.warn("⚠️ Twilio credentials not configured - SMS disabled")
}

export interface SMSMessage {
  to: string
  body: string
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS(message: SMSMessage): Promise<boolean> {
  if (!client || !twilioPhoneNumber) {
    logger.warn("📱 SMS not sent - Twilio not configured")
    return false
  }

  // Validate phone number format (basic check)
  const phoneRegex = /^\+?[1-9]\d{9,14}$/
  const cleanedPhone = message.to.replace(/[\s\-\(\)]/g, "")
  
  if (!phoneRegex.test(cleanedPhone)) {
    logger.error(`📱 Invalid phone number format: ${message.to}`)
    return false
  }

  try {
    const result = await client.messages.create({
      body: message.body,
      from: twilioPhoneNumber,
      to: cleanedPhone.startsWith("+") ? cleanedPhone : `+1${cleanedPhone}`,
    })

    logger.info(`📱 SMS sent successfully: ${result.sid}`)
    return true
  } catch (error) {
    logger.error("📱 Failed to send SMS:", error)
    return false
  }
}

/**
 * Send a goal reminder SMS
 */
export async function sendReminderSMS(
  phoneNumber: string,
  goalTitle: string,
  message: string
): Promise<boolean> {
  const body = `🎯 Accountability Buddy\n\n${message}\n\nGoal: ${goalTitle}\n\nKeep pushing! 💪`
  
  return sendSMS({
    to: phoneNumber,
    body,
  })
}

/**
 * Send a deadline warning SMS
 */
export async function sendDeadlineSMS(
  phoneNumber: string,
  goalTitle: string,
  daysLeft: number
): Promise<boolean> {
  let urgency = ""
  if (daysLeft === 0) {
    urgency = "⚠️ TODAY is the deadline!"
  } else if (daysLeft === 1) {
    urgency = "⏰ Due TOMORROW!"
  } else {
    urgency = `📅 Due in ${daysLeft} days`
  }

  const body = `🎯 Accountability Buddy\n\n${urgency}\n\nGoal: "${goalTitle}"\n\nYou've got this! 💪`

  return sendSMS({
    to: phoneNumber,
    body,
  })
}

/**
 * Send weekly digest via SMS (shorter version)
 */
export async function sendWeeklyDigestSMS(
  phoneNumber: string,
  stats: { completed: number; inProgress: number; streak: number }
): Promise<boolean> {
  const body = `🎯 Weekly Update\n\n✅ Completed: ${stats.completed}\n📊 In Progress: ${stats.inProgress}\n🔥 Streak: ${stats.streak} days\n\nKeep crushing it! 💪`

  return sendSMS({
    to: phoneNumber,
    body,
  })
}

/**
 * Check if SMS service is available
 */
export function isSMSEnabled(): boolean {
  return client !== null && twilioPhoneNumber !== undefined
}

/**
 * Health check for SMS service
 */
export async function smsHealthCheck(): Promise<boolean> {
  if (!client) {
    return false
  }

  try {
    // Just verify the account is accessible
    await client.api.accounts(accountSid!).fetch()
    return true
  } catch (error) {
    logger.error("📱 SMS health check failed:", error)
    return false
  }
}
