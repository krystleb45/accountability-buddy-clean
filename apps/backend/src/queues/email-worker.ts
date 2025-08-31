import { Worker } from "bullmq"

import { sendHtmlEmail } from "../api/services/email-service"
import { logger } from "../utils/winstonLogger"

export const emailWorker = (() => {
  const host = process.env.REDIS_HOST!
  const port = Number(process.env.REDIS_PORT!)

  return new Worker(
    "email-jobs",
    async (job) => {
      const jobType = job.name

      if (jobType === "send-verification-email") {
        const { to, html, text } = job.data
        await sendHtmlEmail(
          to,
          "Accountability Buddy — Verify your email",
          html,
          text,
        )
        logger.debug(`✅ Sent verification email to ${to}`)
        return
      }

      logger.warn(`⚠️ emailWorker received unknown job type: ${jobType}`)
    },
    {
      connection: {
        host,
        port,
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_USE_TLS === "true" ? {} : undefined,
        maxRetriesPerRequest: null,
      },
    },
  ).on("error", (err: Error) => {
    logger.error("❌ emailWorker error", err)
  })
})()
