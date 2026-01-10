import cron from "node-cron"

import { logger } from "../utils/winston-logger.js"
import { ReminderService } from "../api/services/reminder-service.js"
import { DigestService } from "../api/services/digest-service.js"

/**
 * Initialize all cron jobs
 */
export function initReminderCron() {
  // Reminder cron - runs every 5 minutes
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

  // Weekly digest - runs every Monday at 9:00 AM UTC
  cron.schedule("0 9 * * 1", async () => {
    logger.info("📧 Running weekly digest cron job...")
    
    try {
      const sentCount = await DigestService.sendWeeklyDigests()
      logger.info(`📧 Weekly digest complete: ${sentCount} emails sent`)
    } catch (error) {
      logger.error("❌ Weekly digest cron job failed:", error)
    }
  })

  logger.info("✅ Weekly digest cron initialized (runs Mondays at 9:00 AM UTC)")
}