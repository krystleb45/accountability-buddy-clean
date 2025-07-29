// src/constants/permissions.ts

/** Permissions used throughout the app */
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_PROFILE: 'edit_profile',
  DELETE_ACCOUNT: 'delete_account',
  MANAGE_USERS: 'manage_users',
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  MODIFY_SUBSCRIPTIONS: 'modify_subscriptions',
} as const;

/** Union of all permission strings */
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
