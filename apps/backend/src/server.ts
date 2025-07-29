// src/server.ts - Backend Server Entry Point

// ─── Crash Guards ───────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection:", reason);
  process.exit(1);
});

// ─── Imports ─────────────────────────────────────────────────────
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
  process.env.DISABLE_REDIS = "true";
  console.log("✅ Redis forcibly disabled at application startup");
  console.log("📝 All Redis environment variables cleared");
}

import { validateEnv } from "./utils/validateEnv";
validateEnv();

import mongoose from "mongoose";
import { loadSecretsFromAWS } from "./utils/loadSecrets";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { logger } from "./utils/winstonLogger";
import socketServer from "./sockets/index"; // This now returns { io, socketService }

// ─── Extend NodeJS global for Socket.io ────────────────────────
declare global {
  namespace NodeJS {
    interface Global {
      io: Server;
    }
  }
}

// ─── Server Startup ─────────────────────────────────────────────
async function startServer(): Promise<void> {
  try {
    console.log("🚀 Starting server with Redis disabled...");

    // 1) Only load AWS secrets in production, skip for staging
    if (process.env.NODE_ENV === "production" && process.env.AWS_REGION) {
      await loadSecretsFromAWS();
      logger.info("✅ AWS secrets loaded");
    } else {
      logger.info("ℹ️ Skipping AWS secrets for staging environment");
    }

    // 2) Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info("✅ MongoDB connected");

    // 3) Create HTTP server and setup Socket.IO with all features
    const httpServer = createServer(app);

    // 🆕 FIXED: Get both io and socketService from socketServer
    const { io, socketService } = socketServer(httpServer);
    global.io = io;

    // 🆕 REGISTER the socket service with Express app so controllers can access it
    app.set("anonymousMilitarySocketService", socketService);
    logger.info("✅ Anonymous military socket service registered");

    // 4) Start listening
    const PORT = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
      console.log("🚫 Redis status: DISABLED");
      logger.info(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Fatal startup error:", err);
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
  }
}

// ─── Launch ─────────────────────────────────────────────────────
console.log("🎯 Launching server...");
void startServer();
