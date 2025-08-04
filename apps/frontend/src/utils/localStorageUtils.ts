// src/utils/localStorageUtils.ts

/**
 * Check whether the `window.localStorage` API is available and working.
 * @returns `true` if localStorage can be accessed, `false` otherwise.
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const key = "__localStorage_test__"
    window.localStorage.setItem(key, key)
    window.localStorage.removeItem(key)
    return true
  } catch (err) {
    console.warn("localStorage is not available:", (err as Error).message)
    return false
  }
}

/**
 * Safely store a JSON-serializable value under the given key.
 * @param key - The storage key.
 * @param value - The value to serialize and store.
 * @returns `true` if the operation succeeded, `false` otherwise.
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(
      `Failed to set localStorage item "${key}":`,
      (err as Error).message,
    )
    return false
  }
}

/**
 * Safely retrieve and parse a JSON value from localStorage.
 * @param key - The storage key.
 * @returns The parsed value, or `null` if not found or on error.
 */
export function safeGetItem<T = unknown>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch (err) {
    console.error(
      `Failed to get localStorage item "${key}":`,
      (err as Error).message,
    )
    return null
  }
}

/**
 * Safely remove an item by key.
 * @param key - The storage key to remove.
 * @returns `true` if removed (or not present), `false` on error.
 */
export function safeRemoveItem(key: string): boolean {
  if (!isLocalStorageAvailable()) return false
  try {
    window.localStorage.removeItem(key)
    return true
  } catch (err) {
    console.error(
      `Failed to remove localStorage item "${key}":`,
      (err as Error).message,
    )
    return false
  }
}

/**
 * Clear _all_ entries in localStorage.
 * @returns `true` if cleared, `false` on error.
 */
export function clearLocalStorage(): boolean {
  if (!isLocalStorageAvailable()) return false
  try {
    window.localStorage.clear()
    return true
  } catch (err) {
    console.error("Failed to clear localStorage:", (err as Error).message)
    return false
  }
}

/**
 * List all keys currently stored in localStorage.
 * @returns An array of strings, or `[]` if unavailable.
 */
export function getAllLocalStorageKeys(): string[] {
  if (!isLocalStorageAvailable()) return []
  try {
    return Object.keys(window.localStorage)
  } catch (err) {
    console.error("Failed to list localStorage keys:", (err as Error).message)
    return []
  }
}

/**
 * Read every key/value pair from localStorage into an object.
 * @returns A record of parsed values for each key.
 */
export function getAllLocalStorageItems(): Record<string, unknown> {
  if (!isLocalStorageAvailable()) return {}
  const result: Record<string, unknown> = {}
  for (const key of getAllLocalStorageKeys()) {
    const val = safeGetItem<unknown>(key)
    if (val !== null) result[key] = val
  }
  return result
}

/**
 * Check whether a particular key exists in localStorage.
 * @param key - The storage key to check.
 * @returns `true` if the key is present, `false` otherwise.
 */
export function localStorageKeyExists(key: string): boolean {
  if (!isLocalStorageAvailable()) return false
  try {
    return window.localStorage.getItem(key) !== null
  } catch (err) {
    console.error(
      `Error checking existence of "${key}":`,
      (err as Error).message,
    )
    return false
  }
}
