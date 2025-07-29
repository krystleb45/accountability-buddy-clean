// src/constants/uiConstants.ts

/** UI strings and settings, typed as literal constants */
export const UI_CONSTANTS = {
  BUTTON_LABELS: {
    SAVE: 'Save',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    SUBMIT: 'Submit',
    CLOSE: 'Close',
    EDIT: 'Edit',
  },
  PLACEHOLDERS: {
    SEARCH: 'Search...',
    ENTER_TEXT: 'Enter text here...',
    EMAIL: 'Enter your email address',
    PASSWORD: 'Enter your password',
  },
  TOOLTIPS: {
    DELETE: 'Click to delete this item',
    EDIT: 'Click to edit this item',
    SAVE: 'Click to save your changes',
    CANCEL: 'Click to cancel the action',
  },
  MODAL_TEXT: {
    CONFIRM_DELETE: 'Are you sure you want to delete this item? This action cannot be undone.',
    UNSAVED_CHANGES: 'You have unsaved changes. Do you want to discard them?',
  },
  ALERT_MESSAGES: {
    SUCCESS: 'Operation completed successfully!',
    ERROR: 'An error occurred. Please try again later.',
    WARNING: 'Please check the input and try again.',
  },
  ICONS: {
    SUCCESS: '✔️',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
  },
  PAGINATION: {
    ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100] as const,
    DEFAULT_ITEMS_PER_PAGE: 20,
  },
} as const;

/** Top-level type if you need the entire UI constants shape */
export type UIConstants = typeof UI_CONSTANTS;

/** 👉 Button label keys and values */
export type ButtonLabelKey = keyof typeof UI_CONSTANTS.BUTTON_LABELS;
export type ButtonLabel = (typeof UI_CONSTANTS.BUTTON_LABELS)[ButtonLabelKey];

/** 👉 Placeholder keys and values */
export type PlaceholderKey = keyof typeof UI_CONSTANTS.PLACEHOLDERS;
export type Placeholder = (typeof UI_CONSTANTS.PLACEHOLDERS)[PlaceholderKey];

/** 👉 Tooltip keys and values */
export type TooltipKey = keyof typeof UI_CONSTANTS.TOOLTIPS;
export type Tooltip = (typeof UI_CONSTANTS.TOOLTIPS)[TooltipKey];

/** 👉 Modal text keys and values */
export type ModalTextKey = keyof typeof UI_CONSTANTS.MODAL_TEXT;
export type ModalText = (typeof UI_CONSTANTS.MODAL_TEXT)[ModalTextKey];

/** 👉 Alert message keys and values */
export type AlertMessageKey = keyof typeof UI_CONSTANTS.ALERT_MESSAGES;
export type AlertMessage = (typeof UI_CONSTANTS.ALERT_MESSAGES)[AlertMessageKey];

/** 👉 Icon keys and values */
export type IconKey = keyof typeof UI_CONSTANTS.ICONS;
export type Icon = (typeof UI_CONSTANTS.ICONS)[IconKey];

/** 👉 Pagination settings */
export type ItemsPerPageOptions = (typeof UI_CONSTANTS.PAGINATION.ITEMS_PER_PAGE_OPTIONS)[number];
export type DefaultItemsPerPage = typeof UI_CONSTANTS.PAGINATION.DEFAULT_ITEMS_PER_PAGE;
