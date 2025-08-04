// src/constants/appConfig.ts

export interface AppConfig {
  DEFAULT_TIMEZONE: string
  API_TIMEOUT_MS: number
  MAX_UPLOAD_SIZE_MB: number
  SUPPORTED_LANGUAGES: string[]
  FEATURE_FLAGS: {
    ENABLE_NOTIFICATIONS: boolean
    ENABLE_BETA_FEATURES: boolean
    ENABLE_ANALYTICS: boolean
  }
  SECURITY: {
    REQUIRE_2FA: boolean
    PASSWORD_COMPLEXITY: string // you can swap this for a regex string if you prefer
    SESSION_EXPIRATION_MINUTES: number
  }
}

export const APP_CONFIG: AppConfig = {
  // timezone
  DEFAULT_TIMEZONE: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE?.trim() || "UTC",

  // axios / fetch timeout
  API_TIMEOUT_MS: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 5000,

  // maximum upload size in MB
  MAX_UPLOAD_SIZE_MB: Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB) || 10,

  // localization
  SUPPORTED_LANGUAGES: ["en", "es", "fr", "de", "zh"],

  // feature toggles
  FEATURE_FLAGS: {
    ENABLE_NOTIFICATIONS:
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === "true",
    ENABLE_BETA_FEATURES:
      process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === "true",
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  },

  // security settings
  SECURITY: {
    REQUIRE_2FA: process.env.NEXT_PUBLIC_REQUIRE_2FA === "true",
    PASSWORD_COMPLEXITY:
      process.env.NEXT_PUBLIC_PASSWORD_COMPLEXITY ||
      "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$",
    SESSION_EXPIRATION_MINUTES:
      Number(process.env.NEXT_PUBLIC_SESSION_EXPIRATION_MINUTES) || 60,
  },
}
