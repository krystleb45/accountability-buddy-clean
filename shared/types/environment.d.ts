/**
 * TypeScript type definitions for environment variables.
 * These definitions ensure type safety and better IntelliSense support
 * when accessing `process.env` in your application.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // ==========================================
    // General Environment Settings
    // ==========================================
    /**
     * Node environment: 'development', 'production', or 'test'.
     */
    NODE_ENV: 'development' | 'production' | 'test';

    /**
     * Port for the application backend.
     * Example: 3000
     */
    PORT?: string;

    /**
     * Base URL for API endpoints.
     * Example: https://api.example.com
     */
    REACT_APP_API_URL: string;

    // ==========================================
    // Frontend-Specific Environment Variables
    // ==========================================
    /**
     * Public key for a third-party service.
     * Example: pk_test_123456789abcdef
     */
    REACT_APP_PUBLIC_KEY?: string;

    /**
     * Google Analytics tracking ID.
     * Example: UA-12345678-1
     */
    REACT_APP_GA_TRACKING_ID?: string;

    /**
     * Stripe publishable key for frontend payments.
     * Example: pk_live_123456789abcdef
     */
    REACT_APP_STRIPE_KEY?: string;

    /**
     * Feature flag for enabling beta features.
     * Can be 'true' or 'false'.
     */
    REACT_APP_ENABLE_BETA?: 'true' | 'false';

    // ==========================================
    // Backend-Specific Environment Variables
    // ==========================================
    /**
     * URL for the database connection.
     * Example: postgres://username:password@localhost:5432/mydatabase
     */
    DATABASE_URL: string;

    /**
     * JWT secret for signing authentication tokens.
     */
    JWT_SECRET: string;

    /**
     * Expiration time for JSON Web Tokens.
     * Example: 1h, 7d
     */
    JWT_EXPIRATION: string;

    /**
     * Stripe secret key for backend payment integration.
     * Example: sk_live_123456789abcdef
     */
    STRIPE_SECRET_KEY?: string;

    /**
     * Sentry DSN for error tracking.
     * Example: https://examplePublicKey@o0.ingest.sentry.io/0
     */
    SENTRY_DSN?: string;

    // ==========================================
    // Optional External Services
    // ==========================================
    /**
     * Redis connection URL.
     * Example: redis://localhost:6379
     */
    REDIS_URL?: string;

    /**
     * AWS access key for S3 or other services.
     */
    AWS_ACCESS_KEY_ID?: string;

    /**
     * AWS secret key for S3 or other services.
     */
    AWS_SECRET_ACCESS_KEY?: string;

    /**
     * AWS region for deployment.
     * Example: us-east-1
     */
    AWS_REGION?: string;

    /**
     * Mailgun API key for sending emails.
     */
    MAILGUN_API_KEY?: string;

    /**
     * Mailgun domain for email sending.
     */
    MAILGUN_DOMAIN?: string;

    // ==========================================
    // Custom Environment Variables
    // ==========================================
    /**
     * Add any additional environment variables here.
     * Example: CUSTOM_VARIABLE
     */
    [key: string]: string | undefined; // Allow additional custom environment variables
  }
}
