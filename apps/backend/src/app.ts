import bodyParser from "body-parser"
import compression from "compression"
import cors from "cors"
import express from "express"
import mongoSanitize from "express-mongo-sanitize"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import hpp from "hpp"
import morgan from "morgan"
import path from "node:path"
import xssClean from "xss-clean"

import { logger } from "./utils/winston-logger"

// ─── Public route imports ─────────────────────────────────────
import anonymousMilitaryChatRoutes from "./api/routes/anonymous-military-chat-routes"
import authRoutes from "./api/routes/auth"
import faqRoutes from "./api/routes/faq"
import healthRoutes from "./api/routes/healthRoutes"

// ─── Protected route imports ──────────────────────────────────
import status from "http-status"

import { createError, errorHandler } from "./api/middleware/errorHandler"
import notFoundMiddleware from "./api/middleware/notFoundMiddleware"
import activityRoutes from "./api/routes/activity"
import analyticsRoutes from "./api/routes/analytics"
import badgeRoutes from "./api/routes/badge"
import booksRoutes from "./api/routes/books"
import dashboardRoutes from "./api/routes/dashboard"
import feedbackRoutes from "./api/routes/feedback"
import friendsRoutes from "./api/routes/friends"
import gamificationRoutes from "./api/routes/gamification"
import geocodingRoutes from "./api/routes/geocoding"
import goalRoutes from "./api/routes/goal"
import groupRoutes from "./api/routes/groups"
import messageRoutes from "./api/routes/messages"
import militarySupportRoutes from "./api/routes/military-support-routes"
import profileRoutes from "./api/routes/profile"
import progressRoutes from "./api/routes/progress"
import settingsRoutes from "./api/routes/settings"
import streakRoutes from "./api/routes/streaks"
import subscriptionRoutes from "./api/routes/subscription"
import userRoutes from "./api/routes/user"
import setupSwagger from "./config/swaggerConfig"

const app = express()

// ─── Serve uploads folder ─────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// ─── Core middleware ──────────────────────────────────────────
app.use(
  bodyParser.json({
    verify: (req, _, buf) => {
      req.rawBody = buf.toString()
    },
  }),
)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())
app.use(helmet())
// In your backend/src/app.ts, replace the CORS section with this:

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  }),
)
app.use(mongoSanitize())
app.use(xssClean())
app.use(hpp())
app.set("trust proxy", 1) // if behind a proxy (e.g., Heroku, AWS ELB)
app.use(
  rateLimit({
    windowMs: 15 * 60_000,
    max: 500,
    handler: (req, res, next, options) => {
      next(
        createError(
          options.message || "Rate limit exceeded",
          status.TOO_MANY_REQUESTS,
        ),
      )
    },
  }),
)
app.use(
  morgan("dev", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  }),
)

// ─── Test routes (for debugging) ──────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    message: "Backend API is working!",
    timestamp: new Date().toISOString(),
    redis: {
      disabled: process.env.DISABLE_REDIS === "true",
      skipInit: process.env.SKIP_REDIS_INIT === "true",
    },
    availableEndpoints: ["/api/health", "/api/auth", "/api/test"],
  })
})

app.get("/api/test", (_req, res) => {
  res.json({
    message: "Test endpoint working!",
    timestamp: new Date().toISOString(),
    redis: process.env.DISABLE_REDIS === "true" ? "disabled" : "unknown",
  })
})

// ─── PUBLIC routes (NO AUTHENTICATION REQUIRED) ───────────────
app.use("/api/health", healthRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/faqs", faqRoutes)

// 🆕 NEW: Anonymous military chat (PUBLIC - no auth required for crisis support)
app.use("/api/anonymous-military-chat", anonymousMilitaryChatRoutes)
app.use("/api/military-support", militarySupportRoutes)

// Now add all protected routes
app.use("/api/activities", activityRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/badges", badgeRoutes)
app.use("/api/books", booksRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/friends", friendsRoutes)
app.use("/api/gamification", gamificationRoutes)
app.use("/api/geocoding", geocodingRoutes)
app.use("/api/goals", goalRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/streaks", streakRoutes)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/users", userRoutes)

// ─── Meta-test catch-all for *.test ───────────────────────────
app.use((req, res, next) => {
  if (/^\/api\/.+\.test$/.test(req.path)) {
    res.sendStatus(200)
    return
  }
  next()
})

// ─── Setup Swagger ─────────────────────
setupSwagger(app)

// ─── 404 & error handlers ─────────────────────────────────────
app.use(notFoundMiddleware)
app.use(errorHandler)

export default app
