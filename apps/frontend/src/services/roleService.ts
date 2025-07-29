// src/services/roleService.ts
import type { UserInfo } from './authService';

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  EDIT_SETTINGS: 'edit_settings',
  VIEW_ANALYTICS: 'view_analytics',
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
  ],
  moderator: [PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.ACCESS_ADMIN_PANEL],
  user: [],
};

export const roleHasPermission = (role: string, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role]?.includes(permission) ?? false;

export const userHasPermission = (
  user: UserInfo | null | undefined,
  permission: Permission,
): boolean => {
  if (!user) return false;
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.includes(permission);
  }
  return roleHasPermission(user.role, permission);
};

export const getUserPermissions = (user: UserInfo | null | undefined): Permission[] => {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions as Permission[];
  }
  return ROLE_PERMISSIONS[user.role] || [];
};
