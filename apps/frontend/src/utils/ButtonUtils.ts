// src/components/Buttons/ButtonUtils.ts

/**
 * Utility to combine multiple class names into one string.
 * Filters out falsy values automatically.
 */
export function combineClassNames(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ")
}

/**
 * Utility to generate a unique button ID.
 * Uses `crypto.randomUUID` when available, otherwise falls back to Math.random.
 */
export function generateButtonId(prefix: string = "button"): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  // fallback
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Allowed variants for our Button component.
 */
export const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "danger",
  "outline",
] as const
/**
 * Allowed sizes for our Button component.
 */
export const BUTTON_SIZES = ["sm", "md", "lg"] as const

/**
 * Convenience types based on the above constants.
 */
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

/** Type‐guard: is this string a valid ButtonVariant? */
export function isValidButtonVariant(v: string): v is ButtonVariant {
  return (BUTTON_VARIANTS as readonly string[]).includes(v)
}

/** Type‐guard: is this string a valid ButtonSize? */
export function isValidButtonSize(s: string): s is ButtonSize {
  return (BUTTON_SIZES as readonly string[]).includes(s)
}
