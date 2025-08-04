/**
 * Represents a field-specific validation error.
 */
export interface ValidationError {
  /** The field name where the error occurred. */
  field: string

  /** A human-readable message describing the validation error. */
  message: string
}

/**
 * Represents a collection of validation errors for a form or API request.
 */
export interface ValidationErrors {
  /** A list of field-specific validation errors. */
  errors: ValidationError[]

  /** Optional message summarizing the errors. */
  message?: string
}
