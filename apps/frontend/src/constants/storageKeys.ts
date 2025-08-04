// src/constants/storageKeys.ts

/** Keys for sessionStorage/localStorage */
export const STORAGE_KEYS = {
  GOALS: "goals",
  TASKS: "tasks",
  USER_SETTINGS: "userSettings",
  AUTH_TOKEN: "authToken", // ← renamed from JWT_TOKEN
  REFRESH_TOKEN: "refreshToken",
} as const

/** Union of all storage‐key strings */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
