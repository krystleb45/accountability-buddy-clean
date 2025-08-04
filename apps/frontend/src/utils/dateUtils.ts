// src/utils/dateUtils.ts

/**
 * Deep clones an object or array to ensure immutability.
 * Uses `structuredClone()` when available, falling back to JSON methods.
 *
 * @param data - The object or array to clone.
 * @returns A deep copy of the input data.
 */
export function deepClone<T>(data: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(data) as T
  }
  return JSON.parse(JSON.stringify(data)) as T
}

/**
 * Checks if an object is empty (has no own properties).
 *
 * @param obj - The object to check.
 * @returns True if the object is empty, false otherwise.
 */
export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Converts an array of objects into a map using a specified key.
 *
 * @param array - The array of objects.
 * @param key - The key to use as the map identifier.
 * @returns A Map where keys are the specified field, and values are the corresponding objects.
 */
export function arrayToMap<T, K extends keyof T>(
  array: T[],
  key: K,
): Map<T[K], T> {
  return new Map(array.map((item) => [item[key], item]))
}

/**
 * Groups an array of objects by a specified key.
 *
 * @param array - The array of objects.
 * @param key - The key to group by.
 * @returns An object where each key corresponds to a group, and values are arrays of grouped objects.
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key])
    acc[groupKey] = acc[groupKey] ?? []
    acc[groupKey].push(item)
    return acc
  }, {})
}

/**
 * Converts a Map into an array of its values.
 *
 * @param map - The Map to convert.
 * @returns An array of the Map’s values.
 */
export function mapToArray<K, V>(map: Map<K, V>): V[] {
  return Array.from(map.values())
}

/**
 * Merges multiple objects into one.
 *
 * @param objects - The objects to merge.
 * @returns A new object with all merged properties.
 */
export function mergeObjects<T extends Record<string, unknown>>(
  ...objects: T[]
): T {
  return Object.assign({}, ...objects)
}

/**
 * Sorts an array of objects by a specified key.
 *
 * @param array - The array of objects to sort.
 * @param key - The key to sort by.
 * @param ascending - Whether to sort in ascending order (default: true).
 * @returns A new sorted array.
 */
export function sortByKey<T, K extends keyof T>(
  array: T[],
  key: K,
  ascending = true,
): T[] {
  return [...array].sort((a, b) => {
    const aVal = String(a[key])
    const bVal = String(b[key])
    return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })
}

/**
 * Flattens a nested object into a single-level object with dot-separated keys.
 *
 * @param obj - The object to flatten.
 * @param prefix - Internal prefix for recursion (default: '').
 * @returns A flattened object.
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> {
  return Object.entries(obj).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        Object.assign(
          acc,
          flattenObject(value as Record<string, unknown>, newKey),
        )
      } else {
        acc[newKey] = value
      }
      return acc
    },
    {},
  )
}

/**
 * Unflattens a dot-separated key object back into a nested object.
 *
 * @param obj - The flattened object.
 * @returns A nested object.
 */
export function unflattenObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [flatKey, value] of Object.entries(obj)) {
    const parts = flatKey.split(".")
    parts.reduce<Record<string, unknown>>((acc, part, idx) => {
      if (idx === parts.length - 1) {
        acc[part] = value
      } else {
        if (acc[part] === undefined || typeof acc[part] !== "object") {
          acc[part] = {}
        }
        return acc[part] as Record<string, unknown>
      }
      return acc
    }, result)
  }
  return result
}

/**
 * Removes undefined or null values from an object.
 *
 * @param obj - The object to clean.
 * @returns A new object without null or undefined values.
 */
export function cleanObject<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null),
  ) as Partial<T>
}

/**
 * Converts an object to a URL-encoded query string.
 * Properly handles arrays (`?key=value1&key=value2`).
 *
 * @param obj - The object to convert.
 * @returns A URL-encoded query string.
 */
export function objectToQueryString(obj: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)))
    } else {
      params.append(key, String(value))
    }
  }
  return params.toString()
}
