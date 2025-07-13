// src/constants/statusCodes.ts

/** All standard HTTP status codes we use */
export const STATUS_CODES = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/** Union of all status-code values (e.g. 200 | 201 | … | 504) */
export type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

/** Array of all codes for runtime checks */
export const STATUS_CODE_VALUES = Object.values(STATUS_CODES) as StatusCode[];

/**
 * Type-guard to check if a value is one of our StatusCode numbers.
 */
export function isStatusCode(value: unknown): value is StatusCode {
  return typeof value === 'number' && STATUS_CODE_VALUES.includes(value as StatusCode);
}
