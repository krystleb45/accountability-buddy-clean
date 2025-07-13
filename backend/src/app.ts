// src/app.ts - FIXED: Proper route ordering and Redis disable
import dotenvFlow from "dotenv-flow";

// ✅ FIXED: Only load .env files in development
try {
  if (process.env.NODE_ENV !== "production") {
    dotenvFlow.config();
    console.log("✅ Environment configuration loaded from .env files");
  } else {
    console.log("ℹ️ Production mode: Using Railway environment variables directly");
  }
} catch {
  console.log("ℹ️ No .env files found, using environment variables directly");
}

// 🚫 REDIS DISABLE: Force disable Redis at startup BEFORE any other imports
if (process.env.DISABLE_REDIS === "true" || process.env.SKIP_REDIS_INIT === "true") {
  // Clear all Redis-related environment variables
  delete process.env.REDIS_URL;
  delete process.env.REDIS_PRIVATE_URL;
  delete process.env.REDIS_PUBLIC_URL;
  delete process.env.REDIS_HOST;
  delete process.env.REDIS_PORT;
  delete process.env.REDIS_PASSWORD;
  delete process.env.REDIS_USERNAME;

  // Set disabled flag for other modules to check
  process.env.REDIS_DISABLED = "true";
  console.log("✅ Redis forcibly disabled at application startup");
  console.log("📝 All Redis environment variables cleared");
}

import { validateEnv } from "./utils/validateEnv";
validateEnv();

import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";
import hpp from "hpp";
import morgan from "morgan";
import bodyParser from "body-parser";
import { logger } from "./utils/winstonLogger";

// JWT guard
import { protect } from "./api/middleware/authJwt";

// ─── Public route imports ─────────────────────────────────────
import healthRoutes from "./api/routes/healthRoutes";
import authRoutes from "./api/routes/auth";
import faqRoutes from "./api/routes/faq";
import webhooksRoutes from "./api/routes/webhooks";
import anonymousMilitaryChatRoutes from "./api/routes/anonymousMilitaryChatRoutes";

// ─── Protected route imports ──────────────────────────────────
import userRoutes from "./api/routes/user";
import supportRoutes from "./api/routes/support";
import reminderRoutes from "./api/routes/reminder";
import messageRoutes from "./api/routes/messages";
import matchRoutes from "./api/routes/matches";
import auditRoutes from "./api/routes/audit";
import emailRoutes from "./api/routes/email";
import groupRoutes from "./api/routes/groupRoute";
import chatRoutes from "./api/routes/chat";
import paymentRoutes from "./api/routes/payment";
import subscriptionRoutes from "./api/routes/subscription";
import goalRoutes from "./api/routes/goal";
import goalMessageRoutes from "./api/routes/goalMessage";
import friendsRoutes from "./api/routes/friends";
import blogRoutes from "./api/routes/blog";
import booksRoutes from "./api/routes/books";
import notificationsRoutes from "./api/routes/notifications";
import followRoutes from "./api/routes/follow";
import adminRoutes from "./api/routes/adminRoutes";
import adminAnalyticsRoutes from "./api/routes/adminAnalytics";
import adminReports from "./api/routes/adminReports";
import recommendationRoutes from "./api/routes/recommendationRoutes";
import achievementRoutes from "./api/routes/achievement";
import activityRoutes from "./api/routes/activity";
import badgeRoutes from "./api/routes/badgeRoutes";
import challengeRoutes from "./api/routes/challenge";
import collaborationRoutes from "./api/routes/collaborationGoals";
import feedRoutes from "./api/routes/feed";
import progressRoutes from "./api/routes/progress";
import searchRoutes from "./api/routes/search";
import rateLimitRoutes from "./api/routes/rateLimit";
import gamificationRoutes from "./api/routes/gamification";
import dashboardRoutes from "./api/routes/dashboard";
import eventRoutes from "./api/routes/event";
import feedbackRoutes from "./api/routes/feedback";
import fileUploadRoutes from "./api/routes/fileUpload";
import goalAnalyticsRoutes from "./api/routes/goalAnalyticsRoutes";
import historyRoutes from "./api/routes/history";
import leaderboardRoutes from "./api/routes/leaderboard";
import milestoneRoutes from "./api/routes/milestone";
import militarySupportRoutes from "./api/routes/militarySupportRoutes";
import newsletterRoutes from "./api/routes/newsletter";
import notificationTriggersRoutes from "./api/routes/notificationTriggers";
import partnerRoutes from "./api/routes/partner";
import pollRoutes from "./api/routes/pollRoutes";
import profileRoutes from "./api/routes/profile";
import redemptionsRoutes from "./api/routes/redemptions";
import reportRoutes from "./api/routes/report";
import rewardRoutes from "./api/routes/reward";
import roleRoutes from "./api/routes/role";
import sessionRoutes from "./api/routes/sessionRoutes";
import settingsRoutes from "./api/routes/settings";
import streakRoutes from "./api/routes/streaks";
import taskRoutes from "./api/routes/task";
import trackerRoutes from "./api/routes/tracker";
import userPointsRoutes from "./api/routes/userpointsRoute";
import xpHistoryRoutes from "./api/routes/xpHistory";

import notFoundMiddleware from "./api/middleware/notFoundMiddleware";
import { errorHandler } from "./api/middleware/errorHandler";
import setupSwagger from "./config/swaggerConfig";

const app = express();

// 🔍 Log Redis status after all imports
if (process.env.REDIS_DISABLED === "true") {
  console.log("🚫 Redis Status: DISABLED");
  console.log("📋 REDIS_URL:", process.env.REDIS_URL || "undefined");
  console.log("📋 REDIS_PRIVATE_URL:", process.env.REDIS_PRIVATE_URL || "undefined");
}

// ─── Serve uploads folder ─────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Core middleware ──────────────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());
app.use(
  rateLimit({
    windowMs: 15 * 60_000,
    max: 500,
  })
);
app.use(
  morgan("dev", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  })
);

// ─── Test routes (for debugging) ──────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    message: "Backend API is working!",
    timestamp: new Date().toISOString(),
    redis: {
      disabled: process.env.REDIS_DISABLED === "true",
      skipInit: process.env.SKIP_REDIS_INIT === "true"
    },
    availableEndpoints: [
      "/api/health",
      "/api/auth",
      "/api/test"
    ]
  });
});

app.get("/api/test", (_req, res) => {
  res.json({
    message: "Test endpoint working!",
    timestamp: new Date().toISOString(),
    redis: process.env.REDIS_DISABLED === "true" ? "disabled" : "unknown"
  });
});

// ─── PUBLIC routes (NO AUTHENTICATION REQUIRED) ───────────────
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auths", authRoutes);
app.use("/api/faqs", faqRoutes);

// ⚠️ CRITICAL: Webhooks MUST be before protect middleware
app.use("/api/webhooks", webhooksRoutes);

// 🆕 NEW: Anonymous military chat (PUBLIC - no auth required for crisis support)
app.use("/api/anonymous-military-chat", anonymousMilitaryChatRoutes);

// ─── PROTECTED routes (AUTHENTICATION REQUIRED) ───────────────
// Apply protection to all remaining /api/* routes
app.use("/api/*", protect);

// Now add all protected routes
app.use("/api/military-support", militarySupportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/goal-messages", goalMessageRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/reports", adminReports);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/collaboration-goals", collaborationRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/rate-limit", rateLimitRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/file-uploads", fileUploadRoutes);
app.use("/api/analytics", goalAnalyticsRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/milestone", milestoneRoutes);
app.use("/api/newsletters", newsletterRoutes);
app.use("/api/notification-triggers", notificationTriggersRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/redemptions", redemptionsRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/user-points", userPointsRoutes);
app.use("/api/xp-history", xpHistoryRoutes);

// ─── Meta-test catch-all for *.test ───────────────────────────
app.use((req, res, next) => {
  if (/^\/api\/.+\.test$/.test(req.path)) {
    res.sendStatus(200);
    return;
  }
  next();
});

// ─── 404 & error handlers ─────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorHandler);
setupSwagger(app);

export default app;
