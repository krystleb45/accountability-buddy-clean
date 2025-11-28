// src/scripts/cleanupRoles.ts

import dotenv from "dotenv"
import mongoose from "mongoose"

import Role from "../api/models/Role" // Adjust path if needed
import { loadEnvironment } from "../utils/loadEnv"
import { logger } from "../utils/winston-logger"

loadEnvironment()
dotenv.config()

/**
 * Deletes all Role documents from the database.
 */
async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    logger.error("MONGO_URI is not defined in environment variables.")
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: "accountability-buddy",
    })
    logger.info("✅ Connected to MongoDB")

    const result = await Role.deleteMany({})
    logger.info(`🧹 Deleted ${result.deletedCount} roles from the database`)
  } catch (error) {
    logger.error(`❌ Error cleaning up roles: ${(error as Error).message}`)
  } finally {
    await mongoose.disconnect()
    logger.info("🔌 Disconnected from MongoDB")
  }
}

void main()
