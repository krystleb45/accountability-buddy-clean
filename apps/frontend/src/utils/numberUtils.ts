// src/utils/numberUtils.ts

/**
 * Determine whether the given value is a finite number.
 *
 * @param value – the value to test
 * @returns true if `value` is a number, not NaN, and finite
 */
export function isValidNumber(value: unknown): value is number {
  return (
    typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value)
  )
}

/**
 * Generate a random floating-point number in the range [min, max).
 *
 * @param min – inclusive lower bound
 * @param max – exclusive upper bound
 * @throws if min or max isn’t a valid number or min ≥ max
 */
export function getRandomNumber(min: number, max: number): number {
  if (!isValidNumber(min) || !isValidNumber(max) || min >= max) {
    throw new Error(
      "Invalid range: `min` must be < `max`, both finite numbers.",
    )
  }
  return Math.random() * (max - min) + min
}

/**
 * Generate a random integer in the inclusive range [min, max].
 *
 * @param min – inclusive lower bound
 * @param max – inclusive upper bound
 * @throws if min or max isn’t a valid number or min > max
 */
export function getRandomInt(min: number, max: number): number {
  if (!isValidNumber(min) || !isValidNumber(max) || min > max) {
    throw new Error(
      "Invalid range: `min` must be ≤ `max`, both finite numbers.",
    )
  }
  // We want an integer between min and max inclusive
  const low = Math.ceil(min)
  const high = Math.floor(max)
  return Math.floor(Math.random() * (high - low + 1)) + low
}

/**
 * Round a number to a fixed number of decimal places.
 *
 * @param num – the number to round
 * @param decimals – non-negative integer number of decimal places (defaults to 2)
 * @returns the rounded value
 * @throws if `num` isn’t valid or `decimals` is negative or non-integer
 */
export function roundTo(num: number, decimals = 2): number {
  if (!isValidNumber(num) || !Number.isInteger(decimals) || decimals < 0) {
    throw new Error(
      "Invalid arguments: `num` must be a number and `decimals` a non-negative integer.",
    )
  }
  const factor = 10 ** decimals
  return Math.round(num * factor) / factor
}

/**
 * Format a number as localised currency.
 *
 * @param amount – the numeric amount
 * @param currency – ISO 4217 currency code (default "USD")
 * @param locale – BCP 47 locale (default "en-US")
 * @returns a string like "$1,234.56"
 * @throws if `amount` isn’t a valid number
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  if (!isValidNumber(amount)) {
    throw new Error("Invalid amount: must be a finite number.")
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount,
  )
}

/**
 * Convert a fraction (0–1) to a percentage string.
 *
 * @param fraction – e.g. 0.1234
 * @param decimals – decimal places in the percent (default 2)
 * @returns e.g. "12.34%"
 * @throws if `fraction` isn’t valid
 */
export function toPercentage(fraction: number, decimals = 2): string {
  if (!isValidNumber(fraction)) {
    throw new Error("Invalid fraction: must be a finite number.")
  }
  return `${roundTo(fraction * 100, decimals)}%`
}

/**
 * Clamp a number into the inclusive range [min, max].
 *
 * @param num – the value to clamp
 * @param min – lower bound
 * @param max – upper bound
 * @returns the clamped value
 * @throws if bounds are invalid or num isn’t valid
 */
export function clampNumber(num: number, min: number, max: number): number {
  if (
    !isValidNumber(num) ||
    !isValidNumber(min) ||
    !isValidNumber(max) ||
    min > max
  ) {
    throw new Error(
      "Invalid arguments: ensure num, min, max are finite and min ≤ max.",
    )
  }
  return Math.max(min, Math.min(num, max))
}

/**
 * Format a number with thousands separators for a given locale.
 *
 * @param num – the value to format
 * @param locale – BCP 47 locale (default "en-US")
 * @returns a string like "1,234,567"
 * @throws if `num` isn’t valid
 */
export function formatWithCommas(num: number, locale = "en-US"): string {
  if (!isValidNumber(num)) {
    throw new Error("Invalid number: must be finite.")
  }
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Compute the factorial of a non-negative integer.
 *
 * @param n – must be an integer ≥ 0
 * @returns n!
 * @throws if `n` isn’t a non-negative integer
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("Invalid input: factorial requires a non-negative integer.")
  }
  return n <= 1 ? 1 : n * factorial(n - 1)
}

/**
 * Compute the greatest common divisor (GCD) of two integers.
 *
 * @param a – integer
 * @param b – integer
 * @returns gcd(a, b)
 * @throws if inputs aren’t valid numbers
 */
export function gcd(a: number, b: number): number {
  if (!isValidNumber(a) || !isValidNumber(b)) {
    throw new Error("Invalid inputs: gcd requires finite numbers.")
  }
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

/**
 * Compute the least common multiple (LCM) of two integers.
 *
 * @param a – integer
 * @param b – integer
 * @returns lcm(a, b)
 * @throws if inputs aren’t valid numbers
 */
export function lcm(a: number, b: number): number {
  if (!isValidNumber(a) || !isValidNumber(b)) {
    throw new Error("Invalid inputs: lcm requires finite numbers.")
  }
  // Avoid division by zero
  const _gcd = gcd(a, b)
  if (_gcd === 0) return 0
  return Math.abs((a * b) / _gcd)
}
