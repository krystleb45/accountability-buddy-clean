// DashboardUtils.ts

/**
 * Formats a large number into a readable string with commas.
 * @param value - The number to format.
 * @returns A formatted string (e.g., "1,234,567").
 */
export function formatNumber(value: number): string {
  return value.toLocaleString()
}

/**
 * Calculates the completion percentage.
 * @param completed - Number of completed items.
 * @param total - Total number of items.
 * @returns Percentage (rounded to whole number).
 */
export function calculateCompletionPercentage(
  completed: number,
  total: number,
): number {
  if (total <= 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Truncates text to a specified length and appends an ellipsis if it exceeds.
 * @param text - The text to truncate.
 * @param maxLength - Maximum allowed length.
 * @returns Truncated text with "..." if needed.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Filters an array of objects by a specified key and value.
 * @typeParam T - Object type.
 * @param data - Array of objects to filter.
 * @param key - Key to filter by.
 * @param value - Value to match.
 * @returns Filtered array.
 */
export function filterDashboardData<T extends Record<string, unknown>>(
  data: T[],
  key: keyof T,
  value: unknown,
): T[] {
  return data.filter((item) => item[key] === value)
}

/**
 * Sorts an array of objects by a specified key.
 * @typeParam T - Object type.
 * @param data - Array of objects to sort.
 * @param key - Key to sort by.
 * @param ascending - True for ascending; false for descending.
 * @returns Sorted array.
 */
export function sortDashboardData<T extends Record<string, unknown>>(
  data: T[],
  key: keyof T,
  ascending = true,
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key] as number | string
    const bVal = b[key] as number | string
    if (aVal < bVal) return ascending ? -1 : 1
    if (aVal > bVal) return ascending ? 1 : -1
    return 0
  })
}
