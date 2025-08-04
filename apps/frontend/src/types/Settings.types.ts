// src/types/Settings.types.ts

/**
 * A single helpful resource link.
 */
export interface Resource {
  id: string
  name: string
  link: string
}

/**
 * Props for the ResourceLinks component.
 * (Currently empty but reserved for future props.)
 */
export interface ResourceLinksProps {}

/**
 * Shape of the user’s basic profile settings payload.
 */
export interface UserProfileSettings {
  name: string
  email: string
  password?: string
}

/**
 * Props for the ThemeToggle component.
 */
export interface ThemeToggleProps {
  /** Whether dark mode is currently active */
  isDarkMode: boolean
  /** Callback to toggle between light/dark mode */
  onToggle: () => void
}

/**
 * Theme preference: light, dark, or follow system setting.
 */
export type ThemePreference = "light" | "dark" | "system"

/**
 * User-specific settings in the application.
 */
export interface UserSettings {
  /** Theme preference */
  theme: ThemePreference
  /** Whether notifications are enabled */
  notificationsEnabled: boolean
  /** Preferred language (ISO 639-1 code) */
  language: string
  /** Time zone (IANA format) */
  timeZone: string
  /** Accessibility options */
  accessibilityOptions?: {
    highContrastMode?: boolean
    textToSpeech?: boolean
    reduceMotion?: boolean
  }
  /** Detailed notification preferences */
  notificationPreferences?: {
    emailNotifications?: boolean
    pushNotifications?: boolean
    inAppNotifications?: boolean
    preferredTypes?: Array<
      | "info"
      | "success"
      | "error"
      | "warning"
      | "goal"
      | "subscription"
      | "system"
    >
    quietHoursStart?: string // e.g. "22:00"
    quietHoursEnd?: string // e.g. "07:00"
    muteDuringQuietHours?: boolean
  }
  /** Whether to auto-save settings */
  autoSave?: boolean
}

/**
 * Security settings for user accounts.
 */
export interface SecuritySettings {
  twoFactorAuthenticationEnabled: boolean
  loginAlertsEnabled: boolean
  trustedDevices?: Array<{
    deviceId: string
    deviceName: string
    lastUsed: string // ISO timestamp
  }>
  autoLogoutAfterInactivityMinutes?: number
}

/**
 * User preferences collection.
 */
export interface UserPreferences {
  /** Basic user settings */
  userSettings: UserSettings
  /** Security-related settings */
  securitySettings: SecuritySettings
}

/**
 * Global application-wide settings.
 */
export interface AppSettings {
  apiBaseUrl: string
  enablePremiumFeatures: boolean
  maxUploadSizeMB: number
  appVersion: string
  maintenanceMode: boolean
  supportedLanguages: Array<"en" | "es" | "fr" | "de" | "it" | "pt">
  defaultTimeZone: string
  requireEmailVerification: boolean
}

/**
 * Feature toggles for conditional functionality.
 */
export interface FeatureToggles {
  enableGamification: boolean
  enableLeaderboards: boolean
  betaFeatures: boolean
  enableRealTimeChat: boolean
  enableUserAnalytics: boolean
  enableAIRecommendations: boolean
  enableCommunityForums: boolean
}

/**
 * The full settings model combining user prefs, app config, and feature flags.
 */
export interface Settings {
  userPreferences: UserPreferences
  appSettings: AppSettings
  featureToggles: FeatureToggles
}
