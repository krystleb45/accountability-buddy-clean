// src/constants/validationRules.ts

/** All our regex-based validity checks */
export const VALIDATION_REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

/** Min/max lengths for various fields */
export const VALIDATION_LENGTH = {
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 32,
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
} as const;

/** User-facing messages when validation fails */
export const VALIDATION_MESSAGES = {
  EMAIL: 'Please enter a valid email address.',
  PHONE: 'Please enter a valid phone number.',
  URL: 'Please enter a valid URL.',
  PASSWORD:
    'Password must be 8–32 chars, include uppercase, lowercase, number & special character.',
  USERNAME: 'Username must be 3–20 chars and contain no special symbols.',
} as const;

/** Union types for the keys and values */
export type ValidationField = keyof typeof VALIDATION_REGEX;
export type ValidationMessage = (typeof VALIDATION_MESSAGES)[ValidationField];
export type ValidationRegex = (typeof VALIDATION_REGEX)[ValidationField];
