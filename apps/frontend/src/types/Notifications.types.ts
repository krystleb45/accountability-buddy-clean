/**
 * Represents a single notification.
 */
export interface Notification {
  /** Unique identifier for the notification. */
  id: string

  /** Title or subject of the notification. */
  title: string

  /** Detailed message of the notification. */
  message: string

  /** Type of notification (restricted to known categories). */
  type:
    | "info"
    | "success"
    | "error"
    | "warning"
    | "goal"
    | "subscription"
    | "system"

  /** ISO timestamp or Unix timestamp indicating when the notification was created. */
  timestamp: string | number

  /** Indicates whether the notification has been read. */
  isRead: boolean

  /** URL for related action (optional). */
  actionUrl?: string

  /** Additional metadata for the notification (optional). */
  metadata?: Record<string, unknown>

  /** The priority level of the notification. */
  priority?: "low" | "medium" | "high"
}

/**
 * Represents a group of notifications.
 */
export interface NotificationGroup {
  /** Title of the notification group (e.g., "System Alerts", "Achievements"). */
  groupTitle: string

  /** Array of notifications in this group. */
  notifications: Notification[]

  /** Indicates whether all notifications in the group are read. */
  allRead: boolean
}

/**
 * Represents the response structure for fetching notifications from the API.
 */
export interface NotificationResponse {
  /** Total number of notifications available. */
  total: number

  /** Current page of notifications (for paginated responses). */
  currentPage: number

  /** Number of notifications per page. */
  perPage: number

  /** Array of notifications for the current page. */
  notifications: Notification[]

  /** Total number of unread notifications. */
  unreadCount: number
}

/**
 * Represents settings or preferences for notifications.
 */
export interface NotificationPreferences {
  /** Whether to receive email notifications. */
  emailNotifications: boolean

  /** Whether to receive push notifications. */
  pushNotifications: boolean

  /** Whether to receive in-app notifications. */
  inAppNotifications: boolean

  /** Preferred notification types (e.g., "info", "error", "goal"). */
  preferredTypes?: (
    | "info"
    | "success"
    | "error"
    | "warning"
    | "goal"
    | "subscription"
    | "system"
  )[]

  /** Quiet hours start time (ISO 8601 time format, e.g., "22:00:00" for 10 PM). */
  quietHoursStart?: string

  /** Quiet hours end time (ISO 8601 time format, e.g., "07:00:00" for 7 AM). */
  quietHoursEnd?: string

  /** Whether to mute notifications entirely during quiet hours. */
  muteDuringQuietHours?: boolean
}

/**
 * Represents a request to update notification settings.
 */
export interface UpdateNotificationPreferencesRequest {
  /** Whether to enable email notifications. */
  emailNotifications?: boolean

  /** Whether to enable push notifications. */
  pushNotifications?: boolean

  /** Whether to enable in-app notifications. */
  inAppNotifications?: boolean

  /** Preferred notification types. */
  preferredTypes?: (
    | "info"
    | "success"
    | "error"
    | "warning"
    | "goal"
    | "subscription"
    | "system"
  )[]

  /** Quiet hours settings. */
  quietHoursStart?: string
  quietHoursEnd?: string
  muteDuringQuietHours?: boolean
}

/**
 * Represents a notification delivery status.
 */
export interface NotificationDeliveryStatus {
  /** Unique notification ID. */
  notificationId: string

  /** Status of the delivery attempt. */
  status: "delivered" | "failed" | "pending"

  /** Error message if delivery failed (optional). */
  errorMessage?: string

  /** Timestamp of the delivery attempt. */
  timestamp: string | number
}
