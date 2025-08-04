// src/utils/sidebarUtils.ts

/**
 * Checks if the current path exactly matches the given route.
 * @param currentPath - The current window or router path (e.g. '/profile').
 * @param targetPath - The route you want to check (e.g. '/profile').
 * @returns True if they match exactly.
 */
export function isActiveRoute(
  currentPath: string,
  targetPath: string,
): boolean {
  return currentPath === targetPath
}

/**
 * Turns a kebab-case or snake_case string into Title Case.
 * E.g. 'user-profile' → 'User Profile'; 'user_profile' → 'User Profile'.
 * @param label - The raw label to format.
 */
export function formatLabel(label: string): string {
  return label
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Generates a stable React key for sidebar items based on label & index.
 * E.g. generateSidebarKey('User Profile', 2) → 'user-profile-2'.
 * @param label - The label of the item.
 * @param index - Its index in the array.
 */
export function generateSidebarKey(label: string, index: number): string {
  // reuse formatLabel, then kebab-case it and append index
  const kebab = formatLabel(label).toLowerCase().replace(/\s+/g, "-")
  return `${kebab}-${index}`
}
