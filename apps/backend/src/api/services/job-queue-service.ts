import type { Queue } from "bullmq"

import { emailQueue } from "../../queues/email-queue.js"
import { logger } from "../../utils/winston-logger.js"
import { sendHtmlEmail } from "./email-service.js"

class JobQueueService {
  private _emailQueue: Queue

  public get emailQueue() {
    return this._emailQueue
  }

  constructor() {
    logger.info("🔴 JobQueueService attempting to use Redis/Bull")

    this._emailQueue = emailQueue

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await this.shutdown()
      process.exit(0)
    })
    process.on("SIGTERM", async () => {
      await this.shutdown()
      process.exit(0)
    })
  }

  public async addSendEmailJob({
    to,
    subject,
    html,
    text,
  }: {
    to: string
    subject: string
    html: string
    text: string
  }) {
    try {
      await this.emailQueue.add("send-html-email", { to, subject, html, text })
      logger.debug(`🚥 Added email job to queue for ${to}`)
    } catch (error) {
      logger.error(`Failed to add email job: ${(error as Error).message}`)

      // Fallback: send email immediately if queue fails
      try {
        logger.warn(`⚠️ Queue failed, sending email immediately to ${to}`)
        await sendHtmlEmail(to, subject, html, text)
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

const jobQueueService = new JobQueueService()

export const jobQueue = jobQueueService
export default jobQueueService
