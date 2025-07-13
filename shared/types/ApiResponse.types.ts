/**
 * Represents the structure of a standard API response.
 * Ensures consistent typing across frontend and backend.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;  // ✅ Indicates whether the API request was successful
  data?: T;          // ✅ The response data (optional if success is false)
  error?: ApiError;  // ✅ Error information (optional if success is true)
  meta?: ApiMeta;    // ✅ Additional metadata (optional, e.g., pagination info)
}

/**
 * Represents an error object in the API response.
 * Used when `success` is `false`.
 */
export interface ApiError {
  message: string;            // ✅ User-friendly error message
  code?: ApiErrorCode;        // ✅ Standardized error code
  statusCode?: HttpStatusCode; // ✅ HTTP status code for better response handling
  details?: string;           // ✅ Additional debugging info (optional)
  fieldErrors?: FieldError[]; // ✅ Specific field validation errors (optional)
}

/**
 * Represents an error for a specific field, useful for form validation errors.
 */
export interface FieldError {
  field: string;   // ✅ The name of the field with the error
  message: string; // ✅ A user-friendly error message for the field
}

/**
 * Represents optional metadata in an API response.
 * Commonly used for paginated responses or additional contextual data.
 */
export interface ApiMeta {
  totalItems?: number;    // ✅ Total number of items (for pagination)
  totalPages?: number;    // ✅ Total number of pages (if paginated)
  currentPage?: number;   // ✅ Current page number (if paginated)
  pageSize?: number;      // ✅ Number of items per page
  [key: string]: unknown; // ✅ Allows for additional metadata if needed
}

/**
 * Enum for standard API error codes, ensuring consistency across the application.
 */
export enum ApiErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',    // ✅ When a user is not found
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS', // ✅ For failed authentication
  FORBIDDEN = 'FORBIDDEN',              // ✅ When a user is not authorized
  VALIDATION_ERROR = 'VALIDATION_ERROR', // ✅ For field validation errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',    // ✅ Unexpected server error
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND', // ✅ When a resource is missing
  BAD_REQUEST = 'BAD_REQUEST',          // ✅ General invalid request
  CONFLICT = 'CONFLICT',                // ✅ When there's a conflict (e.g., duplicate record)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED', // ✅ Too many requests from the user
}

/**
 * Enum for common HTTP status codes.
 * This improves consistency when handling API responses.
 */
export enum HttpStatusCode {
  OK = 200,              // ✅ Success
  CREATED = 201,         // ✅ Resource created
  NO_CONTENT = 204,      // ✅ No content returned
  BAD_REQUEST = 400,     // ✅ Invalid request
  UNAUTHORIZED = 401,    // ✅ Authentication required
  FORBIDDEN = 403,       // ✅ Access denied
  NOT_FOUND = 404,       // ✅ Resource not found
  CONFLICT = 409,        // ✅ Conflict with existing resource
  TOO_MANY_REQUESTS = 429, // ✅ Rate limit exceeded
  INTERNAL_SERVER_ERROR = 500, // ✅ Server error
}

/**
 * Represents a paginated API response.
 * Extends `ApiResponse` and requires metadata to be present.
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  meta: Required<ApiMeta>; // ✅ Metadata is required for paginated responses
}
