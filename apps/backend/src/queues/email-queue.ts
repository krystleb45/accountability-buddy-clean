import { Queue } from "bullmq"

import { logger } from "../utils/winston-logger.js"

export const emailQueue = (() => {
  const host = process.env.REDIS_HOST!
  if (!host) {
    throw new Error("Missing or invalid REDIS_HOST")
  }
  const port = Number.parseInt(process.env.REDIS_PORT || "6379", 10)

  return new Queue("email-jobs", {
    connection: {
      host,
      port,
      password: process.env.REDIS_PASSWORD || undefined,
      tls: process.env.REDIS_USE_TLS === "true" ? {} : undefined,
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 2_000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }).on("error", (err: Error) => {
    logger.error("❌ emailQueue error:", err)
  })
})()
