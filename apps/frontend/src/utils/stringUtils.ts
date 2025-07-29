// src/utils/stringUtils.ts

/**
 * Capitalizes the first letter of a string.
 * @param str - The string to capitalize.
 * @returns The string with its first letter uppercased (or '' if input is falsy).
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts each word in the string to title case.
 * @param str - The string to convert.
 * @returns The title-cased string.
 */
export function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Converts a string to camelCase.
 * @param str - The string to convert.
 * @returns The camelCased string.
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[\s-]+(.)/g, (_, group1) => group1.toUpperCase())
    .replace(/^\w/, (c) => c.toLowerCase());
}

/**
 * Converts a string to kebab-case.
 * @param str - The string to convert.
 * @returns The kebab-cased string.
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to snake_case.
 * @param str - The string to convert.
 * @returns The snake_cased string.
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Truncates a string to a specified length and appends “...” if truncated.
 * @param str - The string to truncate.
 * @param length - The maximum length (must be ≥ 0).
 * @returns The truncated (or original) string.
 */
export function truncateString(str: string, length: number): string {
  if (length < 0) throw new Error('truncateString: length must be non-negative');
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

/**
 * Reverses a string.
 * @param str - The string to reverse.
 * @returns The reversed string.
 */
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Removes all non-alphanumeric characters.
 * @param str - The string to clean.
 * @returns The cleaned string.
 */
export function removeNonAlphanumeric(str: string): string {
  return str.replace(/[^A-Za-z0-9]/g, '');
}

/**
 * Checks if a string is a palindrome (ignoring case & non-alphanumeric).
 * @param str - The string to check.
 * @returns True if palindrome.
 */
export function isPalindrome(str: string): boolean {
  const cleaned = removeNonAlphanumeric(str).toLowerCase();
  return cleaned === reverseString(cleaned);
}

/**
 * Counts the words in a string.
 * @param str - The string to analyze.
 * @returns The number of words.
 */
export function wordCount(str: string): number {
  const trimmed = str.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Counts the occurrences of a substring.
 * @param str - The main string.
 * @param sub - The substring to count.
 * @returns Number of times `sub` appears in `str`.
 */
export function countOccurrences(str: string, sub: string): number {
  if (sub === '') return str.length + 1;
  return str.split(sub).length - 1;
}

/**
 * Replaces all occurrences of a substring.
 * @param str - The main string.
 * @param search - The substring to replace.
 * @param replacement - The replacement text.
 * @returns The resulting string.
 */
export function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}

/**
 * Generates a random alphanumeric string.
 * @param length - The desired length (must be ≥ 0).
 * @returns A random string of that length.
 */
export function generateRandomString(length: number): string {
  if (length < 0) throw new Error('generateRandomString: length must be non-negative');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Converts “true”|“yes”|“1” to `true`, otherwise `false`.
 * @param str - The string to parse.
 */
export function stringToBoolean(str: string): boolean {
  return /^(true|yes|1)$/i.test(str.trim());
}

/**
 * Trims and normalizes all whitespace to single spaces.
 * @param str - The string to clean.
 */
export function cleanString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export default {
  capitalizeFirstLetter,
  toTitleCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  truncateString,
  reverseString,
  removeNonAlphanumeric,
  isPalindrome,
  wordCount,
  countOccurrences,
  replaceAll,
  generateRandomString,
  stringToBoolean,
  cleanString,
};
