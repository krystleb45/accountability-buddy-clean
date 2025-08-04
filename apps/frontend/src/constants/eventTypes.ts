// src/constants/eventTypes.ts

/** All application event type strings */
export const EVENT_TYPES = {
  // ─── User Events ───────────────────────────────────────────────────────────
  USER_SIGNED_UP: "user:signedUp",
  USER_SIGNED_IN: "user:signedIn",
  USER_SIGNED_OUT: "user:signedOut",
  USER_PROFILE_UPDATED: "user:profileUpdated",
  USER_DELETED: "user:deleted",

  // ─── Task Events ───────────────────────────────────────────────────────────
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_COMPLETED: "task:completed",
  TASK_DELETED: "task:deleted",

  // ─── Notification Events ──────────────────────────────────────────────────
  NOTIFICATION_RECEIVED: "notification:received",
  NOTIFICATION_READ: "notification:read",

  // ─── Payment Events ───────────────────────────────────────────────────────
  PAYMENT_SUCCESS: "payment:success",
  PAYMENT_FAILED: "payment:failed",
  SUBSCRIPTION_RENEWED: "subscription:renewed",
  SUBSCRIPTION_CANCELED: "subscription:canceled",

  // ─── Chat Events ───────────────────────────────────────────────────────────
  MESSAGE_SENT: "chat:messageSent",
  MESSAGE_RECEIVED: "chat:messageReceived",
  MESSAGE_DELETED: "chat:messageDeleted",

  // ─── System Events ─────────────────────────────────────────────────────────
  SYSTEM_ERROR: "system:error",
  SYSTEM_MAINTENANCE: "system:maintenance",
} as const

/** Type-safe union of all event strings */
export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES]

/**
 * Type guard to check at runtime whether a value is one of our EventType keys.
 * Useful if you ever deserialize an incoming message and want to guard it.
 */
export function isEventType(value: unknown): value is EventType {
  return (
    typeof value === "string" &&
    Object.values(EVENT_TYPES).includes(value as EventType)
  )
}
