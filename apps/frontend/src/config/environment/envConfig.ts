// src/config/environment/envConfig.ts

/** Environment names we care about */
export type Environment = "development" | "production" | "test" | "staging"

/** Firebase configuration shape */
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

/** Security headers */
export interface SecurityHeaders {
  contentSecurityPolicy: string
  xFrameOptions: string
  strictTransportSecurity: string
}

/** Main runtime config */
export interface EnvConfig {
  apiBaseUrl: string
  googleApiKey: string
  sentryDsn: string
  environment: Environment

  enableBetaFeatures: boolean
  enableDebugMode: boolean

  auth: {
    tokenKey: string
    refreshTokenKey: string
  }

  appName: string
  appVersion: string

  analyticsId: string
  enableAnalytics: boolean

  requestTimeout: number

  additionalConfig: string

  securityHeaders: SecurityHeaders

  integrations: {
    stripeApiKey: string
    firebaseConfig: FirebaseConfig
  }
}

function strEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback
}
function boolEnv(name: string, fallback = false): boolean {
  const v = process.env[name]
  return typeof v === "string" ? v.toLowerCase() === "true" : fallback
}
function intEnv(name: string, fallback: number): number {
  const v = process.env[name]
  const n = v ? Number.parseInt(v, 10) : Number.NaN
  return Number.isNaN(n) ? fallback : n
}

const envConfig: EnvConfig = {
  apiBaseUrl: strEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000"),
  googleApiKey: strEnv("NEXT_PUBLIC_GOOGLE_API_KEY"),
  sentryDsn: strEnv("NEXT_PUBLIC_SENTRY_DSN"),

  environment: (process.env.NODE_ENV as Environment) ?? "development",

  enableBetaFeatures: boolEnv("NEXT_PUBLIC_ENABLE_BETA", false),
  enableDebugMode: boolEnv("NEXT_PUBLIC_DEBUG_MODE", false),

  auth: {
    tokenKey: strEnv("NEXT_PUBLIC_AUTH_TOKEN_KEY", "authToken"),
    refreshTokenKey: strEnv("NEXT_PUBLIC_REFRESH_TOKEN_KEY", "refreshToken"),
  },

  appName: strEnv("NEXT_PUBLIC_APP_NAME", "Accountability Buddy"),
  appVersion: strEnv("NEXT_PUBLIC_APP_VERSION", "1.0.0"),

  analyticsId: strEnv("NEXT_PUBLIC_ANALYTICS_ID"),
  enableAnalytics: boolEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", true),

  requestTimeout: intEnv("NEXT_PUBLIC_REQUEST_TIMEOUT", 15_000),

  additionalConfig: strEnv("NEXT_PUBLIC_ADDITIONAL_CONFIG", ""),

  securityHeaders: {
    contentSecurityPolicy: strEnv(
      "NEXT_PUBLIC_CSP",
      "default-src 'self'; script-src 'self';",
    ),
    xFrameOptions: strEnv("NEXT_PUBLIC_X_FRAME_OPTIONS", "SAMEORIGIN"),
    strictTransportSecurity: strEnv(
      "NEXT_PUBLIC_HSTS",
      "max-age=31536000; includeSubDomains",
    ),
  },

  integrations: {
    stripeApiKey: strEnv("NEXT_PUBLIC_STRIPE_API_KEY", ""),
    firebaseConfig: {
      apiKey: strEnv("NEXT_PUBLIC_FIREBASE_API_KEY", ""),
      authDomain: strEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", ""),
      projectId: strEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", ""),
      storageBucket: strEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", ""),
      messagingSenderId: strEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", ""),
      appId: strEnv("NEXT_PUBLIC_FIREBASE_APP_ID", ""),
    },
  },
}

/** In production we expect certain keys to be non-empty; warn otherwise */
if (envConfig.environment === "production") {
  if (!envConfig.apiBaseUrl) {
    console.warn("[envConfig] NEXT_PUBLIC_API_BASE_URL is missing.")
  }
  if (!envConfig.googleApiKey) {
    console.warn("[envConfig] NEXT_PUBLIC_GOOGLE_API_KEY is missing.")
  }
  if (!envConfig.sentryDsn) {
    console.warn("[envConfig] NEXT_PUBLIC_SENTRY_DSN is missing.")
  }
}

export default envConfig
