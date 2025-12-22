import { Worker } from "bullmq"

import { sendHtmlEmail } from "../api/services/email-service.js"
import { logger } from "../utils/winston-logger.js"

export const emailWorker = (() => {
  const host = process.env.REDIS_HOST!
  const port = Number(process.env.REDIS_PORT!)

  console.log("🔧 Starting email worker with Redis:", host, port)

  return new Worker(
    "email-jobs",
    async (job) => {
      console.log("📬 Worker received job:", job.name, job.data)
      const jobType = job.name

      if (jobType === "send-html-email") {
        const { to, subject, html, text } = job.data
        console.log("📧 Attempting to send email to:", to)
        try {
          await sendHtmlEmail(to, subject, html, text)
          console.log(`✅ Email sent successfully to ${to}`)
        } catch (error) {
          console.log("❌ Email send error:", error)
          throw error
        }
        return
      }

      logger.warn(`⚠️ emailWorker received unknown job type: ${jobType}`)
    },
    {
      connection: {
        host,
        port,
        password: process.env.REDIS_PASSWORD || undefined,
        family: 6,
        tls: process.env.REDIS_USE_TLS === "true" ? {} : undefined,
        maxRetriesPerRequest: null,
      },
    },
  ).on("error", (err: Error) => {
    console.log("❌ emailWorker error:", err)
    logger.error("❌ emailWorker error", err)
  })
})()