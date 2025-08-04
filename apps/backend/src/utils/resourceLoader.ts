import dotenv from "dotenv"
import mongoose from "mongoose"
import fs from "node:fs"
import path from "node:path"

import type { IExternalSupportResource } from "../api/models/MilitaryResource"

import MilitaryResource from "../api/models/MilitaryResource"
import LoggingService from "../api/services/LoggingService"

dotenv.config()

const defaultSeedPath = path.join(__dirname, "../seed/military_resources.json")

/**
 * Load and seed external military resources from a JSON file
 * @param {string} [jsonPath] - Optional path to the JSON file
 */
export async function seedMilitaryResources(jsonPath?: string): Promise<void> {
  try {
    const filePath = jsonPath || defaultSeedPath

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`)
    }

    const fileContent = fs.readFileSync(filePath, "utf-8")
    const resources: IExternalSupportResource[] = JSON.parse(fileContent)

    if (!Array.isArray(resources)) {
      throw new TypeError(
        "Invalid JSON format: expected an array of resources.",
      )
    }

    let insertedCount = 0

    for (const resource of resources) {
      const exists = await MilitaryResource.findOne({
        title: resource.title,
        url: resource.url,
      })
      if (!exists) {
        await MilitaryResource.create(resource)
        insertedCount++
      }
    }

    await LoggingService.logInfo("✅ Military resources seeded successfully", {
      insertedCount,
      filePath,
    })
  } catch (error) {
    await LoggingService.logError(
      "❌ Failed to seed military resources",
      error as Error,
    )
  }
}

/**
 * Direct command-line execution
 */
if (require.main === module) {
  // Prefix the IIFE with `void` so we're not leaving its returned promise unhandled
  void (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || "")
      await seedMilitaryResources()
      await LoggingService.logInfo("🌱 Resource loading finished. Closing DB.")
      await mongoose.disconnect()
    } catch (err) {
      await LoggingService.logFatal(
        "💥 Error during DB connection or resource loading",
        err as Error,
      )
      process.exit(1)
    }
  })()
}
