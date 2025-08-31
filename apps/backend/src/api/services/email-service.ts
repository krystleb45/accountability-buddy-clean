import type mongoose from "mongoose"

import { getVerifyEmailTemplate } from "@ab/transactional"
import mailchimp from "@mailchimp/mailchimp_transactional"

import appConfig from "../../config/appConfig"
import { logger } from "../../utils/winstonLogger"
import { VerificationToken } from "../models/VerificationToken"
import jobQueue from "./job-queue-service"

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY)

export async function emailServiceHealthCheck(): Promise<boolean> {
  const res = await mailchimpClient.users.ping()

  if (res instanceof Error) {
    logger.error(
      "❌ Email service is unhealthy:",
      res.response.data || res.message,
    )
    throw new TypeError("❌ Email service is unhealthy")
  }

  return res === "PONG!"
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  options: Partial<Omit<mailchimp.MessagesSendRequest, "message">> = {},
): Promise<void> {
  if (!to || !subject) {
    throw new Error("Recipient email and subject are required")
  }

  await mailchimpClient.messages.send({
    message: {
      from_email: process.env.EMAIL_USER!,
      to: [{ email: to }],
      subject,
      text,
    },
    ...options,
  })
}

/**
 * Sends an email with HTML content.
 * @param to - Recipient email address.
 * @param subject - Email subject.
 * @param html - HTML content for the email.
 * @param text - Optional plain text content for the email.
 * @param options - Additional email options.
 */
export async function sendHtmlEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
  options: Partial<Omit<mailchimp.MessagesSendRequest, "message">> = {},
): Promise<void> {
  if (!html) {
    throw new Error("HTML content is required for sending an HTML email")
  }

  const res = await mailchimpClient.messages.send({
    message: {
      from_email: process.env.EMAIL_USER!,
      to: [{ email: to }],
      subject,
      html,
      text,
    },
    ...options,
  })

  if (res instanceof Error) {
    logger.error("❌ Failed to send email:", res.response.data || res.message)
    throw new TypeError("❌ Failed to send email")
  }
}

export async function addSendVerificationEmailJob(
  userId: mongoose.Types.ObjectId,
  userEmail: string,
) {
  const reuseWindowMs = 15 * 60 * 1000 // 15 minutes
  const now = Date.now()

  // Try reusing most recent, unexpired token within reuse window
  const existingTokenDoc = await VerificationToken.findOne({
    user: userId,
  })
    .sort({ createdAt: -1 })
    .exec()

  const canReuse =
    existingTokenDoc &&
    !existingTokenDoc.isExpired() &&
    now - existingTokenDoc.createdAt.getTime() < reuseWindowMs

  const tokenDoc = canReuse
    ? existingTokenDoc
    : await VerificationToken.generate(userId)

  const frontendUrl = appConfig.frontendUrl.replace(/\/$/, "")
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(tokenDoc.token)}`

  const { html, text } = await getVerifyEmailTemplate(
    verifyUrl,
    `${appConfig.frontendUrl}/logo.png`,
  )

  logger.debug(`Verification URL: ${verifyUrl}`)

  jobQueue.addSendVerificationEmailJob({
    to: userEmail,
    html,
    text,
  })
}
