// src/utils/errorUtils.ts

/**
 * Base class for API errors, capturing HTTP status and optional details.
 */
export class ApiError extends Error {
  public readonly statusCode: number | undefined
  public readonly details: string | undefined

  constructor(message: string, statusCode?: number, details?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Error thrown when validation of inputs or payloads fails.
 */
export class ValidationError extends Error {
  public readonly fields: string[] | undefined

  constructor(message: string, fields?: string[]) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = "ValidationError"
    this.fields = fields
  }
}

/**
 * Represents network failures (e.g., request never reached the server).
 */
export class NetworkError extends Error {
  public readonly url: string | undefined
  public readonly method:
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | undefined

  public readonly statusCode: number | undefined

  constructor(
    message: string,
    options?: {
      url?: string
      method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
      statusCode?: number
    },
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = "NetworkError"
    this.url = options?.url
    this.method = options?.method
    this.statusCode = options?.statusCode
  }
}

/**
 * Error for truly unexpected conditions in the application.
 */
export class UnexpectedError extends Error {
  constructor(message = "An unexpected error occurred.") {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = "UnexpectedError"
  }
}

/**
 * Logs an error with optional context to the console.
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (error instanceof Error) {
    console.error(`[${error.name}] ${error.message}`, {
      stack: error.stack,
      ...(context ?? {}),
    })
  } else {
    console.error("[UnknownError] Non-error thrown", {
      error,
      ...(context ?? {}),
    })
  }
}

/**
 * Converts any thrown object into a user-friendly string.
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return `API Error${error.statusCode != null ? ` (${error.statusCode})` : ""}: ${error.message}`
  }
  if (error instanceof ValidationError) {
    const fields = error.fields?.length
      ? ` Fields: ${error.fields.join(", ")}`
      : ""
    return `Validation Error: ${error.message}${fields}`
  }
  if (error instanceof NetworkError) {
    const method = error.method ?? "UNKNOWN"
    const url = error.url ?? "unknown URL"
    return `Network Error: ${method} ${url} — ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unknown error occurred."
}

/**
 * Central handler for API-side errors. Logs and rethrows
 * as the proper subclass so callers can `catch` by type.
 */
export function handleApiError(error: unknown): never {
  if (error instanceof ApiError || error instanceof NetworkError) {
    logError(error, { context: "API" })
    throw error
  }
  if (error instanceof Error) {
    logError(error, { context: "Unexpected" })
    throw new UnexpectedError(error.message)
  }
  logError(error, { context: "Unknown thrown value" })
  throw new UnexpectedError()
}

/**
 * Attempts to pull a human-readable message out of various payload shapes:
 *   { error: '…' } | { message: '…' } | { errors: [{ message: '…' }, …] }
 */
export function extractErrorMessage(response: unknown): string {
  if (typeof response === "object" && response !== null) {
    const obj = response as Record<string, unknown>
    if (typeof obj.error === "string") return obj.error
    if (typeof obj.message === "string") return obj.message
    if (Array.isArray(obj.errors)) {
      // Narrow each entry to { message: unknown }
      const messages = obj.errors
        .filter(
          (e): e is { message: unknown } =>
            typeof e === "object" && e !== null && "message" in e,
        )
        .map((e) => String(e.message))
      if (messages.length) return messages.join(", ")
    }
  }
  return "An error occurred."
}
