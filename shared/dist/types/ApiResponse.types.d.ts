/**
 * Represents the structure of a standard API response.
 * Ensures consistent typing across frontend and backend.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ApiMeta;
}
/**
 * Represents an error object in the API response.
 * Used when `success` is `false`.
 */
export interface ApiError {
    message: string;
    code?: ApiErrorCode;
    statusCode?: HttpStatusCode;
    details?: string;
    fieldErrors?: FieldError[];
}
/**
 * Represents an error for a specific field, useful for form validation errors.
 */
export interface FieldError {
    field: string;
    message: string;
}
/**
 * Represents optional metadata in an API response.
 * Commonly used for paginated responses or additional contextual data.
 */
export interface ApiMeta {
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
    [key: string]: unknown;
}
/**
 * Enum for standard API error codes, ensuring consistency across the application.
 */
export declare enum ApiErrorCode {
    USER_NOT_FOUND = "USER_NOT_FOUND",// ✅ When a user is not found
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",// ✅ For failed authentication
    FORBIDDEN = "FORBIDDEN",// ✅ When a user is not authorized
    VALIDATION_ERROR = "VALIDATION_ERROR",// ✅ For field validation errors
    INTERNAL_ERROR = "INTERNAL_ERROR",// ✅ Unexpected server error
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",// ✅ When a resource is missing
    BAD_REQUEST = "BAD_REQUEST",// ✅ General invalid request
    CONFLICT = "CONFLICT",// ✅ When there's a conflict (e.g., duplicate record)
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}
/**
 * Enum for common HTTP status codes.
 * This improves consistency when handling API responses.
 */
export declare enum HttpStatusCode {
    OK = 200,// ✅ Success
    CREATED = 201,// ✅ Resource created
    NO_CONTENT = 204,// ✅ No content returned
    BAD_REQUEST = 400,// ✅ Invalid request
    UNAUTHORIZED = 401,// ✅ Authentication required
    FORBIDDEN = 403,// ✅ Access denied
    NOT_FOUND = 404,// ✅ Resource not found
    CONFLICT = 409,// ✅ Conflict with existing resource
    TOO_MANY_REQUESTS = 429,// ✅ Rate limit exceeded
    INTERNAL_SERVER_ERROR = 500
}
/**
 * Represents a paginated API response.
 * Extends `ApiResponse` and requires metadata to be present.
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
    meta: Required<ApiMeta>;
}
