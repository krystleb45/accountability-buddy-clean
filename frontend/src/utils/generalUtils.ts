// src/utils/generalUtils.ts

/**
 * Formats a number into a localized currency string.
 *
 * @param amount - The number to format.
 * @param currency - The currency code (e.g., "USD", "EUR").
 * @param locale - The locale for formatting (default: "en-US").
 * @returns A string formatted as currency.
 * @throws An error if the amount is not a valid number.
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Invalid amount provided for currency formatting.');
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/**
 * Creates a debounced version of a function that delays its execution.
 *
 * @param func - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced version of the function.
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Fetches data from a given URL and returns the parsed JSON response.
 *
 * @param url - The URL to fetch data from.
 * @param options - Optional fetch configuration options.
 * @returns A promise resolving to the parsed JSON response.
 * @throws An error if the fetch request fails.
 */
export const fetchData = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    throw new Error(`Error fetching data: ${(error as Error).message}`);
  }
};

/**
 * Validates if the provided email is in a proper format.
 *
 * @param email - The email string to validate.
 * @returns True if the email is valid, false otherwise.
 */
export const validateEmail = (email: string): boolean => {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats a username by trimming unnecessary spaces and ensuring consistent spacing.
 *
 * @param name - The username to format.
 * @returns The formatted username.
 * @throws An error if the input is not a string.
 */
export const formatUserName = (name: string): string => {
  if (typeof name !== 'string') {
    throw new Error('Name must be a string.');
  }
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param str - The string to capitalize.
 * @returns The string with each word capitalized.
 * @throws An error if the input is not a string.
 */
export const capitalizeWords = (str: string): string => {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string.');
  }
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Converts a string to kebab-case.
 *
 * @param str - The string to convert.
 * @returns The kebab-case string.
 * @throws An error if the input is not a string.
 */
export const toKebabCase = (str: string): string => {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string.');
  }
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

/**
 * Generates a random integer within a specified range.
 *
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random integer between min and max (inclusive).
 * @throws An error if min is greater than max.
 */
export const getRandomInt = (min: number, max: number): number => {
  if (min > max) {
    throw new Error('Minimum value cannot be greater than maximum value.');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default {
  formatCurrency,
  debounce,
  fetchData,
  validateEmail,
  formatUserName,
  capitalizeWords,
  toKebabCase,
  getRandomInt,
};
