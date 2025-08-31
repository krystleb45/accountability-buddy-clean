import type { Queue } from "bullmq"

import { emailQueue } from "../../queues/email-queue"
import { logger } from "../../utils/winstonLogger"
import { sendHtmlEmail } from "./email-service"

class JobQueueService {
  private _emailQueue: Queue

  public get emailQueue() {
    return this._emailQueue
  }

  constructor() {
    logger.info("🔴 JobQueueService attempting to use Redis/Bull")

    this._emailQueue = emailQueue

    // Graceful shutdown
    process.on("SIGINT", () => void this.shutdown())
    process.on("SIGTERM", () => void this.shutdown())
  }

  public async addSendVerificationEmailJob({
    to,
    html,
    text,
  }: {
    to: string
    html: string
    text: string
  }) {
    try {
      await this.emailQueue.add("send-verification-email", { to, html, text })
      logger.debug(`🚥 Added email job to queue for ${to}`)
    } catch (error) {
      logger.error(`Failed to add email job: ${(error as Error).message}`)

      // Fallback: send email immediately if queue fails
      try {
        logger.warn(`⚠️ Queue failed, sending email immediately to ${to}`)
        await sendHtmlEmail(
          to,
          "Accountability Buddy — Verify your email",
          html,
          text,
        )
        logger.info(`✅ Email sent directly (bypass queue) to ${to}`)
      } catch (emailError) {
        logger.error(
          `❌ Failed to send email directly: ${(emailError as Error).message}`,
        )
        throw emailError
      }
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this._emailQueue.close()
      logger.info("Job queue shut down gracefully")
    } catch (err: unknown) {
      logger.error(
        "Error shutting down job queue:",
        err instanceof Error ? err.message : err,
      )
    }
  }

  // Health check method
  public getStatus() {
    return {
      status: "running",
    }
  }
}

export default new JobQueueService()
