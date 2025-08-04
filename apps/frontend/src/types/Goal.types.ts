// src/types/Goal.types.ts

/**
 * Represents the core structure of a Goal.
 */
export interface Goal {
  /** Unique identifier for the goal. */
  id: string

  /** The title of the goal. */
  title: string

  /** Detailed description of the goal (optional). */
  description?: string

  /** Current status of the goal. */
  status: "not-started" | "in-progress" | "completed" | "archived"

  /** Percentage of goal completion (0 - 100). */
  progress: number

  /** Due date for the goal (optional, in ISO format). */
  dueDate?: string

  /** Whether this goal is pinned to the user's profile/dashboard. */
  pinned: boolean

  /** Timestamp when the goal was created (ISO format or Unix timestamp). */
  createdAt: string | number

  /** Timestamp when the goal was last updated (ISO format or Unix timestamp). */
  updatedAt?: string | number
}

/**
 * Represents analytics data for a user's goals.
 */
export interface GoalAnalytics {
  /** Total number of goals created by the user. */
  totalGoals: number

  /** Total number of completed goals. */
  completedGoals: number

  /** Total number of goals still in progress. */
  inProgressGoals: number

  /** User's longest goal streak. */
  longestStreak: number

  /** Current active goal streak. */
  currentStreak: number
}

/**
 * A reminder tied to a specific goal.
 */
export interface GoalReminder {
  /** Unique identifier for the reminder. */
  id: string

  /** ID of the associated goal. */
  goalId: string

  /** Date of the reminder in YYYY-MM-DD format. */
  date: string

  /** Time of the reminder in HH:mm format. */
  time: string
}

/**
 * Payload when updating a goal.
 */
export interface UpdateGoalRequest {
  title?: string
  description?: string
  status?: "not-started" | "in-progress" | "completed" | "archived"
  progress?: number
  dueDate?: string
  pinned?: boolean
}

/**
 * Response shape when fetching a paginated list of goals.
 */
export interface GoalListResponse {
  /** Total count of goals in the system. */
  totalGoals: number

  /** Current page number. */
  currentPage: number

  /** Number of goals per page. */
  goalsPerPage: number

  /** The goals returned for this page. */
  goals: Goal[]
}

/**
 * Response shape when fetching goal analytics.
 */
export interface GoalAnalyticsResponse {
  analytics: GoalAnalytics
}
