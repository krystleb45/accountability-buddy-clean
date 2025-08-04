// src/config/logging/logConfig.ts
import * as Sentry from "@sentry/react"
import LogRocket from "logrocket"

interface LogConfig {
  sentryDsn: string
  sentryEnabled: boolean
  logRocketAppId: string
  logRocketEnabled: boolean
  enableLogging: boolean
  initSentry: (this: LogConfig) => void
  initLogRocket: (this: LogConfig) => void
  log: (
    this: LogConfig,
    message: string,
    level?: "info" | "warn" | "error",
    additionalContext?: Record<string, unknown>,
  ) => void
  setUserContext: (
    this: LogConfig,
    user: { id?: string; email?: string; username?: string },
  ) => void
  clearUserContext: (this: LogConfig) => void
}

const logConfig: LogConfig = {
  // Sentry Configuration
  sentryDsn: process.env.REACT_APP_SENTRY_DSN || "",
  sentryEnabled:
    process.env.NODE_ENV === "production" && !!process.env.REACT_APP_SENTRY_DSN,

  // LogRocket Configuration
  logRocketAppId: process.env.REACT_APP_LOGROCKET_APP_ID || "",
  logRocketEnabled:
    process.env.NODE_ENV === "production" &&
    !!process.env.REACT_APP_LOGROCKET_APP_ID,

  // Enable/Disable Console Logging
  enableLogging:
    process.env.REACT_APP_ENABLE_LOGGING === "true" ||
    process.env.NODE_ENV === "development",

  initSentry(this: LogConfig): void {
    if (this.sentryEnabled) {
      Sentry.init({
        dsn: this.sentryDsn,
        tracesSampleRate: Number.parseFloat(
          process.env.REACT_APP_SENTRY_SAMPLE_RATE || "1.0",
        ),
        environment: process.env.NODE_ENV,
        release: process.env.REACT_APP_VERSION || "unknown",
      })
      console.info("Sentry initialized for error tracking")
    }
  },

  initLogRocket(this: LogConfig): void {
    if (this.logRocketEnabled) {
      LogRocket.init(this.logRocketAppId)
      if (this.sentryEnabled) {
        LogRocket.getSessionURL((sessionURL) => {
          Sentry.setContext("session", { url: sessionURL })
        })
      }
      console.info("LogRocket initialized for session tracking")
    }
  },

  log(
    this: LogConfig,
    message: string,
    level: "info" | "warn" | "error" = "info",
    additionalContext?: Record<string, unknown>,
  ): void {
    if (this.enableLogging) {
      console[level](message, additionalContext || "")
    }
    if (this.sentryEnabled && level === "error") {
      Sentry.captureException(new Error(message), {
        extra: additionalContext || {},
      })
    }
  },

  setUserContext(
    this: LogConfig,
    user: { id?: string; email?: string; username?: string },
  ): void {
    if (this.sentryEnabled) {
      Sentry.setUser(user)
    }
    if (this.logRocketEnabled) {
      LogRocket.identify(user.id || "unknown", {
        email: user.email,
        name: user.username,
      })
    }
  },

  clearUserContext(this: LogConfig): void {
    if (this.sentryEnabled) {
      Sentry.setUser(null)
    }
    if (this.logRocketEnabled) {
      LogRocket.identify("unknown", {})
    }
  },
}

// Auto-initialize
logConfig.initSentry()
logConfig.initLogRocket()

export default logConfig
