/** Keys for sessionStorage/localStorage */
export const STORAGE_KEYS = {
  GOALS: "ab_goals",
  TASKS: "ab_tasks",
  USER_SETTINGS: "ab_user_settings",
  NEWSLETTER_DISMISSED: "ab_newsletter_dismissed",
} as const

/** Union of all storage‐key strings */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
