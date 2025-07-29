// src/utils/activities.ts

/**
 * Formats an ISO timestamp string into the user's locale.
 *
 * @param timestamp - An ISO date/time string.
 * @returns A localized date/time string.
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Truncates a string to the given maximum length, adding an ellipsis if needed.
 *
 * @param text - The text to truncate.
 * @param maxLength - The maximum allowed length.
 * @returns The truncated text, with `…` appended if it was longer than `maxLength`.
 */
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.substring(0, maxLength)}…` : text;
}
