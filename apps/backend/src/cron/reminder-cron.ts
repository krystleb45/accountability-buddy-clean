import cron from "node-cron"

import { logger } from "../utils/winston-logger.js"
import { ReminderService } from "../api/services/reminder-service.js"

/**
 * Initialize reminder cron jobs
 * Runs every 5 minutes to check for due reminders
 */
export function initReminderCron() {
  // Run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    logger.info("⏰ Running reminder cron job...")
    
    try {
      const processedCount = await ReminderService.processDueReminders()
      
      if (processedCount > 0) {
        logger.info(`⏰ Processed ${processedCount} reminders`)
      }
    } catch (error) {
      logger.error("❌ Reminder cron job failed:", error)
    }
  })

  logger.info("✅ Reminder cron job initialized (runs every 5 minutes)")
}