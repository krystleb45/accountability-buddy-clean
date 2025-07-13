/**
 * Represents the structure of an authentication token.
 */
export interface AuthToken {
  /** The JWT token string used for authentication. */
  token: string;

  /** The expiration timestamp of the token (supports Unix timestamp or ISO date). */
  expiresAt: number | string;

  /** The type of token (currently limited to "Bearer"). */
  type?: 'Bearer';
}

/**
 * Represents the structure of a decoded JWT payload.
 */
export interface DecodedJwtPayload {
  /** The user ID associated with the token. */
  sub: string;

  /** The expiration timestamp of the token (in Unix format). */
  exp: number;

  /** The issued-at timestamp (in Unix format, optional). */
  iat?: number;

  /** The issuer of the token (optional). */
  iss?: string;

  /** The audience for which the token is intended (optional). */
  aud?: string | string[];

  /** Additional claims if needed. */
  [key: string]: unknown;
}

/**
 * Represents the required credentials for user login.
 */
export interface LoginCredentials {
  /** The user's email address. */
  email: string;

  /** The user's password. */
  password: string;
}

/**
 * Represents the data required for user registration.
 */
export interface RegistrationData {
  /** The user's full name. */
  name: string;

  /** The user's email address. */
  email: string;

  /** The user's password. */
  password: string;

  /** Additional registration fields (optional). */
  [key: string]: unknown;
}

/**
 * Represents the structure of the authenticated user's information.
 */
export interface AuthenticatedUser {
  /** The unique ID of the user. */
  id: string;

  /** The full name of the user. */
  name: string;

  /** The email address of the user. */
  email: string;

  /** The user's assigned role (restricted to known roles). */
  role: 'admin' | 'user' | 'moderator';

  /** Indicates if the user's email has been verified. */
  emailVerified: boolean;

  /** The timestamp of the last login (ISO format or Unix timestamp). */
  lastLoginAt?: string | number;

  /** The user's profile picture URL (optional). */
  avatarUrl?: string;

  /** Additional user-related fields. */
  [key: string]: unknown;
}

/**
 * Represents the structure of a login response.
 */
export interface LoginResponse {
  /** The authentication token issued upon successful login. */
  token: AuthToken;

  /** The authenticated user's profile information. */
  user: AuthenticatedUser;
}

/**
 * Represents the structure of a registration response.
 */
export interface RegistrationResponse {
  /** The registered user's information. */
  user: AuthenticatedUser;

  /** The authentication token, if provided upon registration. */
  token?: AuthToken;
}

/**
 * Represents a response for refreshing the authentication token.
 */
export interface TokenRefreshResponse {
  /** The new authentication token. */
  token: AuthToken;
}

/**
 * Represents the structure of password reset data.
 */
export interface PasswordResetRequest {
  /** The email address of the user requesting a password reset. */
  email: string;
}

/**
 * Represents the structure of a password reset confirmation.
 */
export interface PasswordResetConfirmation {
  /** The reset token sent to the user's email. */
  resetToken: string;

  /** The new password set by the user. */
  newPassword: string;
}

/**
 * Represents the structure of a two-factor authentication (2FA) setup.
 */
export interface TwoFactorAuthSetup {
  /** Indicates whether 2FA is enabled for the user. */
  isEnabled: boolean;

  /** The secret key used for 2FA authentication (optional, only for setup). */
  secretKey?: string;

  /** The URL for the QR code to scan for authentication apps. */
  qrCodeUrl?: string;
}

/**
 * Represents the data required to verify a two-factor authentication code.
 */
export interface TwoFactorAuthVerification {
  /** The verification code entered by the user. */
  code: string;

  /** The user's authentication token (if applicable). */
  token?: string;
}
