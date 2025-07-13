// src/constants/responseMessages.ts

/** ✅ Success response messages */
export const RESPONSE_SUCCESS_MESSAGES = {
  USER_CREATED: 'User successfully created.',
  USER_UPDATED: 'User updated successfully.',
  USER_DELETED: 'User deleted successfully.',
  TASK_COMPLETED: 'Task completed successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  OPERATION_SUCCESS: 'Operation completed successfully.',
} as const;

export type ResponseSuccessKey = keyof typeof RESPONSE_SUCCESS_MESSAGES;
export type ResponseSuccessMessage = (typeof RESPONSE_SUCCESS_MESSAGES)[ResponseSuccessKey];

/** ❌ Error response messages */
export const RESPONSE_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials provided.',
  ACCESS_DENIED: 'You do not have permission to access this resource.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  VALIDATION_FAILED: 'Validation failed. Please check your input.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
} as const;

export type ResponseErrorKey = keyof typeof RESPONSE_ERROR_MESSAGES;
export type ResponseErrorMessage = (typeof RESPONSE_ERROR_MESSAGES)[ResponseErrorKey];

/** ℹ️ Informational response messages */
export const RESPONSE_INFO_MESSAGES = {
  PASSWORD_RESET_REQUESTED: 'A password reset request has been sent to your email.',
  EMAIL_VERIFICATION_REQUIRED: 'Please verify your email before proceeding.',
  ACCOUNT_PENDING_APPROVAL: 'Your account is pending approval.',
} as const;

export type ResponseInfoKey = keyof typeof RESPONSE_INFO_MESSAGES;
export type ResponseInfoMessage = (typeof RESPONSE_INFO_MESSAGES)[ResponseInfoKey];

/** ⚠️ Warning response messages */
export const RESPONSE_WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes. Do you want to proceed?',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this item? This action cannot be undone.',
} as const;

export type ResponseWarningKey = keyof typeof RESPONSE_WARNING_MESSAGES;
export type ResponseWarningMessage = (typeof RESPONSE_WARNING_MESSAGES)[ResponseWarningKey];
