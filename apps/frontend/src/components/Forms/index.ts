// components/Forms/index.ts - Centralized exports for the Forms module

// Export form components
export { default as ForgotPassword } from "./ForgotPassword"
// Export styles (if needed for customization or usage in other components)
export { default as formStyles } from "./Forms.module.css"
export { default as NewsletterSignup } from "./NewsletterSignup"
export { default as Register } from "./Register"
export { default as ReminderForm } from "./ReminderForm"
export { default as ResetPassword } from "./ResetPassword"

export { default as Signup } from "./Signup"

// Export utilities
export * from "@/utils/FormsUtils"
