/**
 * TypeScript declarations for environment variables.
 * Ensures consistent typing across both frontend and backend.
 */

declare namespace NodeJS {
  export interface ProcessEnv {
    // ✅ Remove `REACT_APP_API_URL` if already defined elsewhere

    // General Settings
    BASE_URL?: string; // Base URL of the application

    // Frontend Environment Variables
    // ✅ If still needed, ensure it's correctly declared **only once**
    REACT_APP_GOOGLE_ANALYTICS_ID?: string; // Google Analytics tracking ID
    REACT_APP_STRIPE_PUBLIC_KEY?: string; // Stripe public key for frontend

    // Backend Environment Variables
    DATABASE_URL: string; // Database connection string
    JWT_SECRET: string; // Secret for signing JWT tokens
    JWT_EXPIRATION: string; // Expiration time for JWT tokens
    STRIPE_SECRET_KEY?: string; // Stripe secret key for backend
    SENTRY_DSN?: string; // Sentry DSN for error tracking

    // Optional Services
    REDIS_URL?: string; // Redis URL for caching
    AWS_ACCESS_KEY_ID?: string; // AWS access key
    AWS_SECRET_ACCESS_KEY?: string; // AWS secret key
    AWS_REGION?: string; // AWS region (e.g., us-east-1)
    MAILGUN_API_KEY?: string; // Mailgun API key
    MAILGUN_DOMAIN?: string; // Mailgun domain

    // Feature Flags or Custom Variables
    ENABLE_EXPERIMENTAL_FEATURES?: 'true' | 'false'; // Feature flag
    CUSTOM_VAR_1?: string; // Custom variable
    CUSTOM_VAR_2?: string; // Custom variable
  }
}
