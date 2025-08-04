// src/types/Gamification.types.ts

/**
 * UI-friendly badge data, including its image URL.
 * Always includes imageUrl as a string.
 */
export interface BadgeData {
  id: string
  name: string
  description: string
  imageUrl: string

  /**
   * Optional alias for imageUrl — some components refer to `badge.icon`.
   */
  icon?: string

  /**
   * Optional fallback type/name for alt text — some components refer to `badge.badgeType`.
   */
  badgeType?: string

  /**
   * Optional category for grouping in the UI (e.g. tabs “Streak”, “Milestone”, “Community”).
   */
  category?: "Streak" | "Milestone" | "Community"

  /** Whether the user has unlocked this badge */
  isEarned: boolean

  /** When the badge was earned (if applicable) */
  dateEarned?: string
}

/** Alias for backward compatibility */
export type Badge = BadgeData

/**
 * Full user progress payload from the backend.
 * Includes level, streak, XP-to-next-level, and earned badges.
 */
export interface UserProgress {
  /** User’s unique ID */
  id: string

  /** User’s display name */
  name: string

  /** Total XP/points earned */
  points: number

  /** Current level */
  level: number

  /** Current day streak */
  streak: number

  /** XP needed to reach the next level (if known) */
  pointsToNextLevel?: number

  /** Percent progress toward the next level (0–100) */
  progressToNextLevel?: number

  /** Any newly-earned badge this session */
  newBadge?: BadgeData

  /** All badges the user owns */
  badges: BadgeData[]
}

/** Supported leaderboard types (for maybe future use) */
export type LeaderboardType = "global" | "challenge"

/** An entry in the gamification leaderboard. */
export interface LeaderboardEntry {
  userId: string
  displayName: string
  score: number
  rank: number
  avatarUrl?: string
  /** Optional metadata (e.g. milestone name or number) */
  metadata?: {
    milestone?: string | number
    [key: string]: unknown
  }
  challengeId?: string
  challengeTitle?: string
  badgeIcon?: string
}

/** (Optional) full leaderboard response shape */
export interface LeaderboardResponse {
  totalUsers: number
  currentPage: number
  usersPerPage: number
  leaderboard: LeaderboardEntry[]
}
