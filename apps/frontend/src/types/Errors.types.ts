import type { NetworkError } from "./NetworkErrors.types"
import type { ValidationError } from "./ValidationErrors.types"

/**
 * Represents the structure of a standard API error response.
 */
export interface ApiError {
  /** The error code returned by the API (e.g., HTTP status code or custom code). */
  code: string | number

  /** A short, human-readable message describing the error. */
  message: string

  /** Additional details about the error (optional). */
  details?: string

  /** Any field-specific validation errors (optional). */
  validationErrors?: ValidationError[]
}

/**
 * Represents the structure of an application error.
 */
export interface AppError {
  /** A unique identifier for the error (e.g., UUID or timestamp). */
  id?: string

  /** A short title or summary of the error. */
  title: string

  /** A detailed description of the error. */
  description?: string

  /** The severity level of the error. */
  severity: "info" | "warning" | "error"

  /** Any additional metadata related to the error (optional). */
  metadata?: Record<string, unknown>
}

/**
 * Represents a global error handler configuration.
 */
export interface GlobalErrorHandlerConfig {
  /** Whether to log the error to the console. */
  logToConsole?: boolean

  /** Whether to report the error to an external monitoring service. */
  reportToMonitoring?: boolean

  /** A custom callback to handle errors. */
  customHandler?: (error: AppError | ApiError | NetworkError) => void
}
