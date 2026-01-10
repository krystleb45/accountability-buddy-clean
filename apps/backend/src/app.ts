import * as Sentry from "@sentry/node"
import bodyParser from "body-parser"
import compression from "compression"
import cors from "cors"
import express from "express"
import mongoSanitize from "express-mongo-sanitize"
import rateLimit from "express-rate-limit"
import { xss } from "express-xss-sanitizer"
import helmet from "helmet"
import hpp from "hpp"
import morgan from "morgan"
import path from "node:path"

import { logger } from "./utils/winston-logger.js"

// ─── Public route imports ─────────────────────────────────────
import anonymousMilitaryChatRoutes from "./api/routes/anonymous-military-chat-routes.js"
import authRoutes from "./api/routes/auth.js"
import faqRoutes from "./api/routes/faq.js"
import healthRoutes from "./api/routes/healthRoutes.js"
import contactSupportRoutes from "./api/routes/contact-support.js"
import adminFeedbackRoutes from "./api/routes/admin-feedback.js"
import newsletterRoutes from "./api/routes/newsletter.js"

// ─── Protected route imports ──────────────────────────────────
import status from "http-status"

import { createError, errorHandler } from "./api/middleware/errorHandler.js"
import notFoundMiddleware from "./api/middleware/notFoundMiddleware.js"
import activityRoutes from "./api/routes/activity.js"
import analyticsRoutes from "./api/routes/analytics.js"
import badgeRoutes from "./api/routes/badge.js"
import booksRoutes from "./api/routes/books.js"
import dashboardRoutes from "./api/routes/dashboard.js"
import feedbackRoutes from "./api/routes/feedback.js"
import friendsRoutes from "./api/routes/friends.js"
import gamificationRoutes from "./api/routes/gamification.js"
import geocodingRoutes from "./api/routes/geocoding.js"
import goalRoutes from "./api/routes/goal.js"
import groupRoutes from "./api/routes/groups.js"
import messageRoutes from "./api/routes/messages.js"
import militarySupportRoutes from "./api/routes/military-support-routes.js"
import profileRoutes from "./api/routes/profile.js"
import progressRoutes from "./api/routes/progress.js"
import settingsRoutes from "./api/routes/settings.js"
import streakRoutes from "./api/routes/streaks.js"
import subscriptionRoutes from "./api/routes/subscription.js"
import userRoutes from "./api/routes/user.js"
import setupSwagger from "./config/swaggerConfig.js"
import blogRoutes from "./api/routes/blog.js"
import adminStatsRoutes from "./api/routes/admin-stats.js"
import adminUsersRoutes from "./api/routes/admin-users.js"
import blockRoutes from "./api/routes/block.js"
import reminderRoutes from "./api/routes/reminders.js"


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
app.use(xss())
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

// ─── Sentry test route ────────────────────────────────────────
app.get("/api/debug-sentry", (_req, _res) => {
  throw new Error("My first Sentry error!")
})

// ─── PUBLIC routes (NO AUTHENTICATION REQUIRED) ───────────────
app.use("/api/health", healthRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/faqs", faqRoutes)
app.use("/api/contact-support", contactSupportRoutes)
app.use("/api/admin/feedback", adminFeedbackRoutes)
app.use("/api/newsletter", newsletterRoutes)

// 🆕 NEW: Anonymous military chat (PUBLIC - no auth required for crisis support)
app.use("/api/anonymous-military-chat", anonymousMilitaryChatRoutes)
app.use("/api/military-support", militarySupportRoutes)

// Now add all protected routes
app.use("/api/activities", activityRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/badges", badgeRoutes)
app.use("/api/books", booksRoutes)
app.use("/api/blog", blogRoutes)
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
app.use("/api/admin/stats", adminStatsRoutes)
app.use("/api/admin/users", adminUsersRoutes)
app.use("/api/block", blockRoutes)
app.use("/api/reminders", reminderRoutes)


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

// Sentry error handler (must be before other error handlers)
Sentry.setupExpressErrorHandler(app)

app.use(errorHandler)

export { app }
export default app