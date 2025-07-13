// src/constants/cookies.ts
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
export type CookieName = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];
