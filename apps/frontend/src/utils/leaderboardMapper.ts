// src/utils/leaderboardMapper.ts

/**
 * Maps a UI “sort by” value into the corresponding backend field name.
 *
 * @param uiValue - One of the UI‐facing sort keys.
 * @returns The field name your API expects.
 */
export function mapSortBy(
  uiValue: "xp" | "goals" | "streak",
): "points" | "completedGoals" | "streakCount" {
  switch (uiValue) {
    case "xp":
      return "points"
    case "goals":
      return "completedGoals"
    case "streak":
      return "streakCount"
    default:
      // This should never happen because uiValue is strictly typed.
      // We still return a valid fallback to satisfy TS.
      return "points"
  }
}

/**
 * Maps a UI “time range” value into the corresponding backend range key.
 *
 * @param uiValue - The UI‐facing time ranges.
 * @returns The string your API expects for filtering.
 */
export function mapTimeRange(
  uiValue: "week" | "month" | "all",
): "weekly" | "monthly" | "all" {
  switch (uiValue) {
    case "week":
      return "weekly"
    case "month":
      return "monthly"
    case "all":
      return "all"
    default:
      // Again, unreachable under our types, but safe for TS.
      return "all"
  }
}
