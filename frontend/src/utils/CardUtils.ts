// src/utils/cardUtils.ts

/**
 * Combine conditional class names into a single string.
 * Filters out falsy values (`'', undefined, false`).
 */
export function combineClassNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a simple unique ID for cards (or anything).
 * Client-side only; collisions extremely unlikely in UI.
 */
export function generateCardId(prefix = 'card'): string {
  // Use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  // Fallback
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}
