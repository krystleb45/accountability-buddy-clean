/**
 * TypeScript type definitions for User-related objects and utilities.
 * These definitions ensure consistent handling of user-related data
 * across both frontend and backend.
 */
/**
 * Represents a user's role in the system.
 */
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MODERATOR"] = "moderator";
    UserRole["USER"] = "user";
    UserRole["GUEST"] = "guest";
})(UserRole || (UserRole = {}));
