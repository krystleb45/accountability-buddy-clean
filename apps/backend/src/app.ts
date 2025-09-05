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

import { logger } from "./utils/winstonLogger"

// ─── Public route imports ─────────────────────────────────────
import anonymousMilitaryChatRoutes from "./api/routes/anonymousMilitaryChatRoutes"
import authRoutes from "./api/routes/auth"
import faqRoutes from "./api/routes/faq"
import healthRoutes from "./api/routes/healthRoutes"

// ─── Protected route imports ──────────────────────────────────
import status from "http-status"

import { createError, errorHandler } from "./api/middleware/errorHandler"
import notFoundMiddleware from "./api/middleware/notFoundMiddleware"
import achievementRoutes from "./api/routes/achievement"
import activityRoutes from "./api/routes/activity"
import adminAnalyticsRoutes from "./api/routes/adminAnalytics"
import adminReports from "./api/routes/adminReports"
import adminRoutes from "./api/routes/adminRoutes"
import auditRoutes from "./api/routes/audit"
import badgeRoutes from "./api/routes/badge"
import blogRoutes from "./api/routes/blog"
import booksRoutes from "./api/routes/books"
import challengeRoutes from "./api/routes/challenge"
import chatRoutes from "./api/routes/chat"
import collaborationRoutes from "./api/routes/collaborationGoals"
import dashboardRoutes from "./api/routes/dashboard"
import eventRoutes from "./api/routes/event"
import feedRoutes from "./api/routes/feed"
import feedbackRoutes from "./api/routes/feedback"
import fileUploadRoutes from "./api/routes/fileUpload"
import followRoutes from "./api/routes/follow"
import friendsRoutes from "./api/routes/friends"
import gamificationRoutes from "./api/routes/gamification"
import goalRoutes from "./api/routes/goal"
import goalAnalyticsRoutes from "./api/routes/goalAnalyticsRoutes"
import goalMessageRoutes from "./api/routes/goalMessage"
import groupRoutes from "./api/routes/groupRoute"
import historyRoutes from "./api/routes/history"
import matchRoutes from "./api/routes/matches"
import messageRoutes from "./api/routes/messages"
import milestoneRoutes from "./api/routes/milestone"
import militarySupportRoutes from "./api/routes/militarySupportRoutes"
import newsletterRoutes from "./api/routes/newsletter"
import notificationsRoutes from "./api/routes/notifications"
import notificationTriggersRoutes from "./api/routes/notificationTriggers"
import partnerRoutes from "./api/routes/partner"
import pollRoutes from "./api/routes/pollRoutes"
import profileRoutes from "./api/routes/profile"
import progressRoutes from "./api/routes/progress"
import rateLimitRoutes from "./api/routes/rateLimit"
import recommendationRoutes from "./api/routes/recommendationRoutes"
import redemptionsRoutes from "./api/routes/redemptions"
import reminderRoutes from "./api/routes/reminder"
import reportRoutes from "./api/routes/report"
import rewardRoutes from "./api/routes/reward"
import roleRoutes from "./api/routes/role"
import searchRoutes from "./api/routes/search"
import sessionRoutes from "./api/routes/sessionRoutes"
import settingsRoutes from "./api/routes/settings"
import streakRoutes from "./api/routes/streaks"
import subscriptionRoutes from "./api/routes/subscription"
import supportRoutes from "./api/routes/support"
import taskRoutes from "./api/routes/task"
import trackerRoutes from "./api/routes/tracker"
import userRoutes from "./api/routes/user"
import userPointsRoutes from "./api/routes/userpointsRoute"
import xpHistoryRoutes from "./api/routes/xpHistory"
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
    origin: [
      "https://accountability-buddy-clean.vercel.app",
      "https://accountability-buddy-clean-git-main-krystle-berry-s-projects.vercel.app",
      "http://localhost:3000", // for local development
      "http://localhost:3001", // backup local port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  }),
)
app.use(mongoSanitize())
app.use(xssClean())
app.use(hpp())
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

// Now add all protected routes
app.use("/api/military-support", militarySupportRoutes)
app.use("/api/users", userRoutes)
app.use("/api/support", supportRoutes)
app.use("/api/reminders", reminderRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/matches", matchRoutes)
app.use("/api/audit", auditRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/goals", goalRoutes)
app.use("/api/goal-messages", goalMessageRoutes)
app.use("/api/friends", friendsRoutes)
app.use("/api/blog", blogRoutes)
app.use("/api/books", booksRoutes)
app.use("/api/notifications", notificationsRoutes)
app.use("/api/follow", followRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/admin/analytics", adminAnalyticsRoutes)
app.use("/api/admin/reports", adminReports)
app.use("/api/recommendations", recommendationRoutes)
app.use("/api/achievements", achievementRoutes)
app.use("/api/activities", activityRoutes)
app.use("/api/badges", badgeRoutes)
app.use("/api/challenges", challengeRoutes)
app.use("/api/collaboration-goals", collaborationRoutes)
app.use("/api/feed", feedRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/rate-limit", rateLimitRoutes)
app.use("/api/gamification", gamificationRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/file-uploads", fileUploadRoutes)
app.use("/api/analytics", goalAnalyticsRoutes)
app.use("/api/history", historyRoutes)
app.use("/api/milestone", milestoneRoutes)
app.use("/api/newsletter", newsletterRoutes)
app.use("/api/notification-triggers", notificationTriggersRoutes)
app.use("/api/partner", partnerRoutes)
app.use("/api/polls", pollRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/redemptions", redemptionsRoutes)
app.use("/api/report", reportRoutes)
app.use("/api/rewards", rewardRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/sessions", sessionRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/streaks", streakRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/tracker", trackerRoutes)
app.use("/api/user-points", userPointsRoutes)
app.use("/api/xp-history", xpHistoryRoutes)

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
