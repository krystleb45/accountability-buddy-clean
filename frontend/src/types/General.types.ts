/**
 * Centralized type definitions for general-purpose components and utilities
 */

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode; // Elements rendered within the boundary
  fallbackMessage?: string; // Optional error message displayed on failure
}

/**
 * Props for a generic Modal component
 */
export interface ModalProps {
  isOpen: boolean; // Modal visibility flag
  onClose: () => void; // Callback to close the modal
  title?: string; // Optional header title
  children?: React.ReactNode; // Modal body content
  footer?: React.ReactNode; // Optional footer actions
}

/**
 * Data shape for NewsletterSignup form submissions
 */
export interface NewsletterSignupData {
  email: string; // User's email address
  consent: boolean; // Newsletter consent flag
}

/**
 * Props for simple reusable text components
 */
export interface SimpleComponentProps {
  text: string; // Text to display
  onClick?: () => void; // Optional click handler
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean; // Indicates request outcome
  message?: string; // Optional status message
  data?: T; // Optional payload
}

/**
 * Props for a reusable Button component
 */
export interface ButtonProps {
  text: string; // Button label
  onClick: () => void; // Click event handler
  disabled?: boolean; // Disable interaction
  variant?: 'primary' | 'secondary' | 'danger' | 'success'; // Visual style variant
}
