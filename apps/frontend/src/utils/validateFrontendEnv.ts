// src/utils/validateFrontendEnv.ts

import { getPublicEnvVar } from "./env" // ← was "@/utils/env"

const REQUIRED_KEYS = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_STRIPE_PUBLIC_KEY",
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_APP_VERSION",
] as const
type EnvKey = (typeof REQUIRED_KEYS)[number]

export function validateFrontendEnv(): void {
  // Gather them all in one place
  const env: Record<EnvKey, string | null> = REQUIRED_KEYS.reduce(
    (acc, key) => {
      acc[key] = getPublicEnvVar(key)
      return acc
    },
    {} as Record<EnvKey, string | null>,
  )

  console.log("🔍 Frontend env vars:", env)

  const missing = REQUIRED_KEYS.filter(
    (key) => !env[key] || env[key]!.trim() === "",
  )
  if (missing.length > 0) {
    console.warn(`⚠️ Missing NEXT_PUBLIC_ vars: ${missing.join(", ")}`)
  } else {
    console.log("✅ All required NEXT_PUBLIC_ vars are set.")
  }
}
