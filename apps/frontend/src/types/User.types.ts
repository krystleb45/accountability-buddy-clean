import type { Achievement } from "../api/achievements/achievementsApi"
import type { Goal } from "../services/goalService"

/**
 * Represents a Friend connection.
 */
export interface Friend {
  id: string
  name: string
}

/**
 * Represents the core user profile information.
 */
export interface UserProfile {
  /** Unique identifier for the user. */
  id: string

  /** The full name of the user. */
  fullName: string

  /** The user's email address. */
  email: string

  /** Indicates if the user's email is verified. */
  emailVerified: boolean

  /** The user's role in the system. */
  role: "admin" | "user" | "moderator" | "guest"

  /** The URL of the user's profile picture (optional). */
  avatarUrl?: string

  /** The user's preferred language (e.g., "en", "es", "fr"). */
  preferredLanguage?: string

  /** The user's timezone in IANA format (e.g., "America/New_York"). */
  timeZone?: string

  /** The timestamp of the last login (ISO format or Unix timestamp). */
  lastLoginAt?: string | number

  /** The date when the user registered (ISO format or Unix timestamp). */
  registeredAt: string | number

  /** Indicates if the user is active or banned. */
  status: "active" | "suspended" | "banned"

  /** Additional metadata related to the user (optional). */
  metadata?: Record<string, unknown>

  /** ✅ The list of followers (new field). */
  followers: string[]

  /** ✅ The list of users the person follows (new field). */
  following: string[]

  /** ✅ The goals pinned by the user (new field). */
  pinnedGoals: string[]

  /** ✅ The achievements featured by the user (new field). */
  featuredAchievements: string[]
}

/**
 * Represents the full user profile including additional details.
 */
export interface FullUserProfile extends UserProfile {
  /** Short biography of the user. */
  bio: string

  /** User's location. */
  location: string

  /** List of user interests. */
  interests: string[]

  /** Profile image URL. */
  profileImage: string

  /** Cover image URL. */
  coverImage: string

  /** List of achievements earned. */
  achievements: Achievement[]

  /** ✅ List of user goals (including pinned status). */
  goals: (Goal & { pinned: boolean })[]

  /** List of user connections (friends). */
  connections: Friend[]

  /** Whether the logged-in user is following this user. */
  isFollowing: boolean
}

/**
 * Represents additional user settings and preferences.
 */
export interface UserPreferences {
  /** The user's selected theme preference. */
  theme: "light" | "dark" | "system"

  /** The user's notification settings. */
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    inAppNotifications: boolean
    preferredTypes?: (
      | "info"
      | "success"
      | "error"
      | "goal"
      | "system"
      | "subscription"
    )[]
    quietHoursStart?: string
    quietHoursEnd?: string
    muteDuringQuietHours?: boolean
  }

  /** Accessibility preferences for the user. */
  accessibilityOptions?: {
    highContrastMode: boolean
    textToSpeech: boolean
    reduceMotion: boolean
  }

  /** Indicates whether to auto-save settings without confirmation. */
  autoSave?: boolean
}

/**
 * Represents security settings for a user.
 */
export interface UserSecuritySettings {
  /** Indicates whether two-factor authentication (2FA) is enabled. */
  twoFactorAuthenticationEnabled: boolean

  /** Indicates whether login alerts are enabled. */
  loginAlertsEnabled: boolean

  /** A list of trusted devices associated with the user. */
  trustedDevices?: {
    deviceId: string
    deviceName: string
    lastUsed: string | number // ISO timestamp or Unix format
  }[]

  /** Whether the system should automatically log out inactive sessions. */
  autoLogoutAfterInactivityMinutes?: number
}

/**
 * Represents the complete user profile with settings and security preferences.
 */
export interface User {
  interests: unknown
  /** Core user information. */
  profile: UserProfile

  /** User preferences and settings. */
  preferences: UserPreferences

  /** User security settings. */
  securitySettings: UserSecuritySettings
}

/**
 * Represents a request to update user profile details.
 */
export interface UpdateUserProfileRequest {
  /** Updated full name (optional). */
  fullName?: string

  /** Updated profile picture URL (optional). */
  avatarUrl?: string

  /** Updated preferred language (optional). */
  preferredLanguage?: string

  /** Updated timezone (optional). */
  timeZone?: string

  /** ✅ Updated pinned goals list. */
  pinnedGoals?: string[]

  /** ✅ Updated featured achievements list. */
  featuredAchievements?: string[]
}

/**
 * Represents a request to update user settings.
 */
export interface UpdateUserPreferencesRequest {
  /** Updated theme preference. */
  theme?: "light" | "dark" | "system"

  /** Updated notification settings. */
  notifications?: Partial<UserPreferences["notifications"]>

  /** Updated accessibility options. */
  accessibilityOptions?: Partial<UserPreferences["accessibilityOptions"]>

  /** Updated auto-save preference. */
  autoSave?: boolean
}

/**
 * Represents a response when retrieving user details.
 */
export interface UserResponse {
  /** The user's full profile, preferences, and security settings. */
  user: User
}

/**
 * Represents a list of users for admin or system-wide queries.
 */
export interface UserListResponse {
  /** The total number of users. */
  totalUsers: number

  /** The current page number (for pagination). */
  currentPage: number

  /** The number of users per page. */
  usersPerPage: number

  /** The array of user profiles returned in the response. */
  users: UserProfile[]
}

/**
 * Represents an admin action to update a user's status.
 */
export interface UpdateUserStatusRequest {
  /** The ID of the user whose status is being updated. */
  userId: string

  /** The new status for the user. */
  status: "active" | "suspended" | "banned"

  /** The reason for the status update (optional). */
  reason?: string
}
