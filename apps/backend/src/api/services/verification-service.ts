import type mongoose from "mongoose"

import { getVerifyEmailTemplate } from "@ab/transactional"

import appConfig from "../../config/appConfig"
import { logger } from "../../utils/winstonLogger"
import { VerificationToken } from "../models/VerificationToken"
import jobQueue from "./job-queue-service"

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

  jobQueue.addSendEmailJob({
    to: userEmail,
    subject: "Accountability Buddy — Verify your email",
    html,
    text,
  })
}

export async function addSendResetPasswordEmailJob(
  userId: mongoose.Types.ObjectId,
  userEmail: string,
) {
  // Generate password reset token
  // Invalidate any and all existing reset tokens FIRST
  await VerificationToken.deleteMany({ user: userId })
  const resetTokenDoc = await VerificationToken.generate(userId, 15 * 60)

  const frontendUrl = appConfig.frontendUrl.replace(/\/$/, "")
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetTokenDoc.token)}`

  const { html, text } = await getVerifyEmailTemplate(
    resetUrl,
    `${appConfig.frontendUrl}/logo.png`,
  )

  logger.debug(`Reset Password URL: ${resetUrl}`)

  jobQueue.addSendEmailJob({
    to: userEmail,
    subject: "Accountability Buddy — Reset your password",
    html,
    text,
  })
}
