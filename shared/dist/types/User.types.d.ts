/**
 * TypeScript type definitions for User-related objects and utilities.
 * These definitions ensure consistent handling of user-related data
 * across both frontend and backend.
 */
/**
 * Represents a user in the system.
 */
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
    username: string;
}
/**
 * Represents a public user profile.
 * Used when exposing user information to other users.
 */
export interface PublicUserProfile {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    bio?: string;
}
/**
 * Represents an authenticated user session.
 */
export interface AuthenticatedUser extends User {
    token: string;
    refreshToken?: string;
    permissions: string[];
}
/**
 * Represents input data for creating a new user.
 */
export interface CreateUserInput {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: UserRole;
    metadata?: Record<string, any>;
}
/**
 * Represents input data for updating a user's information.
 */
export interface UpdateUserInput {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    isActive?: boolean;
    metadata?: Record<string, any>;
}
/**
 * Represents a user's role in the system.
 */
export declare enum UserRole {
    ADMIN = "admin",// Administrative user
    MODERATOR = "moderator",// Moderator user
    USER = "user",// Standard user
    GUEST = "guest"
}
/**
 * Represents user-related API responses.
 */
export interface UserApiResponse {
    success: boolean;
    user?: User;
    error?: {
        message: string;
        code?: string;
    };
}
/**
 * Represents a paginated list of users.
 */
export interface PaginatedUsersResponse {
    success: boolean;
    data: User[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
    };
}
/**
 * Represents input for user authentication (login).
 */
export interface LoginInput {
    email: string;
    password: string;
}
/**
 * Represents input for resetting a user's password.
 */
export interface ResetPasswordInput {
    email: string;
    newPassword: string;
    resetToken: string;
}
