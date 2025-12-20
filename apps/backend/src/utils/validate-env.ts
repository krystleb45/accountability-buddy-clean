import { logger } from "./winston-logger.js"

const requiredEnvVars: string[] = [
  "MONGO_URI",
  "PORT",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "ALLOWED_ORIGINS",
  "SESSION_SECRET",
  "MAILCHIMP_TRANSACTIONAL_API_KEY",
  "EMAIL_USER",
  "REDIS_HOST",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET",
  "ENCRYPTION_KEY",
  "GOOGLE_GEOLOCATION_API_KEY",
]

const optionalButRecommended: string[] = []

export function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key])

  if (missing.length > 0) {
    logger.error(
      `❌ Missing required environment variables:\n${missing.join("\n")}`,
    )
    process.exit(1)
  }

  optionalButRecommended.forEach((key) => {
    if (!process.env[key]) {
      logger.warn(`⚠️ Recommended env var not set: ${key}`)
    }
  })

  logger.debug("✅ All required environment variables are present.")
}
