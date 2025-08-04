// src/constants/roles.ts

/** All available roles as literal values */
export const ROLES = {
  GUEST: "guest",
  USER: "user",
  PREMIUM_USER: "premium_user",
  MODERATOR: "moderator",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const

/** Union type of all role strings */
export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Numeric hierarchy for comparing permissions */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.GUEST]: 1,
  [ROLES.USER]: 2,
  [ROLES.PREMIUM_USER]: 3,
  [ROLES.MODERATOR]: 4,
  [ROLES.ADMIN]: 5,
  [ROLES.SUPER_ADMIN]: 6,
} as const

/**
 * Check if `userRole` has at least the same level as `requiredRole`.
 */
export function hasAccess(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Type-guard: validate that a runtime value is one of our defined roles.
 */
export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    (Object.values(ROLES) as Role[]).includes(value as Role)
  )
}
