// src/utils/recommendationsUtils.ts

/**
 * Filters a list of items (with sharedGoals) down to only those
 * that have at least one goal in common with the user.
 *
 * @param items    Array of items that each have a `sharedGoals: string[]` field
 * @param userGoals  Array of the user's own goal titles
 * @returns        A new array containing only items sharing ≥1 goal
 */
export function filterBySharedGoals<T extends { sharedGoals: string[] }>(
  items: T[],
  userGoals: string[],
): T[] {
  return items.filter((item) => item.sharedGoals.some((goal) => userGoals.includes(goal)));
}

/**
 * Sorts a list of items alphabetically by their `name` field.
 *
 * @param items  Array of items that each have a `name: string` field
 * @returns      A new array sorted A→Z by `name`
 */
export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Ensures a recommendation link is a fully qualified URL.
 * If the input is missing or already has HTTP/HTTPS, returns as-is;
 * otherwise prepends `https://`.
 *
 * @param link  Optional URL string
 * @returns     A valid URL or a placeholder message
 */
export function formatRecommendationLink(link?: string): string {
  if (!link) return 'No link available';
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}
