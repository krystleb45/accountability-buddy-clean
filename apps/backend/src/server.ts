// src/server.ts - Backend Server Entry Point
// ─── Imports ────────────────────────────────────────────────────
import type { Server } from "socket.io"

import dotenvFlow from "dotenv-flow"
import mongoose from "mongoose"
import { createServer } from "node:http"

import { loadSecretsFromAWS } from "./utils/loadSecrets"
import { validateEnv } from "./utils/validate-env"
import { logger } from "./utils/winstonLogger"

// ─── Crash Guards ───────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err)
  process.exit(1)
})
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection:", reason)
  process.exit(1)
})

// --- Environment Configuration ----------------------------------
// Only load .env files in development
if (process.env.NODE_ENV !== "production") {
  dotenvFlow.config()
  logger.info("✅ Environment configuration loaded from .env files")
} else {
  logger.info(
    "ℹ️ Production mode: Using Railway environment variables directly",
  )
}

validateEnv()

// ─── Extend NodeJS global for Socket.io ────────────────────────-
declare global {
  // eslint-disable-next-line vars-on-top
  var io: Server
}

// ─── Server Startup ─────────────────────────────────────────────
async function startServer(): Promise<void> {
  try {
    // 1) Only load AWS secrets in production, skip for staging
    if (process.env.NODE_ENV === "production" && process.env.AWS_REGION) {
      await loadSecretsFromAWS()
      logger.info("✅ AWS secrets loaded")
    } else {
      logger.info("ℹ️ Skipping AWS secrets for staging environment")
    }

    // 2) Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: "accountability-buddy",
    })
    logger.info("✅ MongoDB connected")

    // 2a) Check up on email service
    const emailService = await import("./api/services/email-service")
    const emailServiceHealthy = await emailService.emailServiceHealthCheck()
    if (emailServiceHealthy) {
      logger.info("📧 Email service is healthy")
    } else {
      logger.error("❌ Email service is unhealthy")
    }

    // 2b) Check on job queue (Redis)
    const jobQueue = (await import("./api/services/job-queue-service")).default
    const jobQueueHealthy = jobQueue.getStatus().status === "running"
    if (jobQueueHealthy) {
      logger.info("✅ Job queue is healthy")
    } else {
      logger.error("❌ Job queue is unhealthy")
    }

    // 2c) Start email worker
    await import("./queues/email-worker")

    // 2d) Check the health of S3 connection
    const fileUploadService = await import(
      "./api/services/file-upload-service"
    ).then((mod) => mod.FileUploadService)
    const s3Healthy = await fileUploadService.healthCheck()
    if (s3Healthy) {
      logger.info("✅ S3 connection is healthy")
    } else {
      logger.error("❌ S3 connection is unhealthy")
    }

    const app = await import("./app").then((mod) => mod.default)
    const socketServer = await import("./sockets").then((mod) => mod.default)

    // 3) Create HTTP server and setup Socket.IO with all features
    const httpServer = createServer(app)

    const { io } = socketServer(httpServer)
    globalThis.io = io
    logger.info("✅ Socket.IO server initialized")

    // 4) Start listening
    const PORT = Number.parseInt(process.env.PORT || "5000", 10)
    httpServer.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server listening on port ${PORT}`)
    })
  } catch (err) {
    logger.error("❌ Fatal startup error:", err)
    await (await import("./queues/email-worker")).emailWorker.close()
    process.exit(1)
  }
}

// ─── Launch ─────────────────────────────────────────────────────
void startServer()
