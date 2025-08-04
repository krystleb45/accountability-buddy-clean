// src/constants/messages.ts

/** Error message constants */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error occurred. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  FORBIDDEN: "You do not have permission to access this resource.",
  SERVER_ERROR: "A server error occurred. Please try again later.",
  VALIDATION_ERROR:
    "Some fields have invalid inputs. Please check and try again.",
} as const

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES
export type ErrorMessage = (typeof ERROR_MESSAGES)[ErrorMessageKey]

/** Success message constants */
export const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: "Registration successful!",
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logout successful!",
  TASK_CREATED: "Task created successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  PASSWORD_CHANGED: "Your password has been updated successfully!",
} as const

export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES
export type SuccessMessage = (typeof SUCCESS_MESSAGES)[SuccessMessageKey]

/** Notification message constants */
export const NOTIFICATION_MESSAGES = {
  DEFAULT_SUCCESS: "Operation completed successfully!",
  DEFAULT_ERROR: "An error occurred. Please try again.",
  NEW_NOTIFICATION: "You have a new notification.",
  ALL_MARKED_AS_READ: "All notifications marked as read.",
} as const

export type NotificationMessageKey = keyof typeof NOTIFICATION_MESSAGES
export type NotificationMessage =
  (typeof NOTIFICATION_MESSAGES)[NotificationMessageKey]

/** UI message constants */
export const UI_MESSAGES = {
  LOADING: "Loading, please wait...",
  EMPTY_STATE: "No data available.",
  SEARCH_PLACEHOLDER: "Search...",
  NO_RESULTS_FOUND: "No results found.",
  CONFIRM_DELETE: "Are you sure you want to delete this item?",
} as const

export type UIMessageKey = keyof typeof UI_MESSAGES
export type UIMessage = (typeof UI_MESSAGES)[UIMessageKey]
