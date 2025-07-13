/**
 * TypeScript type definitions for User-related objects and utilities.
 * These definitions ensure consistent handling of user-related data
 * across both frontend and backend.
 */

/**
 * Represents a user in the system.
 */
export interface User {
    id: string; // Unique identifier for the user
    email: string; // User's email address
    firstName: string; // User's first name
    lastName: string; // User's last name
    role: UserRole; // Role of the user (e.g., admin, user, etc.)
    isActive: boolean; // Indicates whether the user is active
    createdAt: string; // ISO timestamp for when the user was created
    updatedAt: string; // ISO timestamp for when the user was last updated
    metadata?: Record<string, any>; // Optional additional metadata about the user
    username: string;
  }

  /**
   * Represents a public user profile.
   * Used when exposing user information to other users.
   */
  export interface PublicUserProfile {
    id: string; // Public user identifier
    firstName: string; // User's first name
    lastName: string; // User's last name
    avatarUrl?: string; // URL to the user's avatar or profile picture
    bio?: string; // Short user bio
  }

  /**
   * Represents an authenticated user session.
   */
  export interface AuthenticatedUser extends User {
    token: string; // JWT or session token for the user
    refreshToken?: string; // Optional refresh token for renewing sessions
    permissions: string[]; // List of permissions associated with the user
  }

  /**
   * Represents input data for creating a new user.
   */
  export interface CreateUserInput {
    email: string; // User's email address
    firstName: string; // User's first name
    lastName: string; // User's last name
    password: string; // User's password
    role?: UserRole; // Optional role (default is 'user')
    metadata?: Record<string, any>; // Optional additional metadata
  }

  /**
   * Represents input data for updating a user's information.
   */
  export interface UpdateUserInput {
    email?: string; // Updated email address
    firstName?: string; // Updated first name
    lastName?: string; // Updated last name
    password?: string; // Updated password
    isActive?: boolean; // Whether the user is active
    metadata?: Record<string, any>; // Optional additional metadata
  }

  /**
   * Represents a user's role in the system.
   */
  export enum UserRole {
    ADMIN = 'admin', // Administrative user
    MODERATOR = 'moderator', // Moderator user
    USER = 'user', // Standard user
    GUEST = 'guest', // Guest or unauthenticated user
  }

  /**
   * Represents user-related API responses.
   */
  export interface UserApiResponse {
    success: boolean; // Whether the operation was successful
    user?: User; // User data (if successful)
    error?: {
      message: string; // Error message
      code?: string; // Optional error code
    };
  }

  /**
   * Represents a paginated list of users.
   */
  export interface PaginatedUsersResponse {
    success: boolean; // Whether the operation was successful
    data: User[]; // List of user objects
    meta: {
      total: number; // Total number of users
      page: number; // Current page number
      pageSize: number; // Number of users per page
    };
  }

  /**
   * Represents input for user authentication (login).
   */
  export interface LoginInput {
    email: string; // User's email address
    password: string; // User's password
  }

  /**
   * Represents input for resetting a user's password.
   */
  export interface ResetPasswordInput {
    email: string; // User's email address
    newPassword: string; // New password
    resetToken: string; // Token provided for resetting the password
  }
