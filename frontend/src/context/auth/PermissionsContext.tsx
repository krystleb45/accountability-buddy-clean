// src/context/auth/PermissionsContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';

// 1️⃣ Import centralized Role & hierarchy helper
import { ROLES, Role, hasAccess } from '@/constants/roles';
// 2️⃣ Import Permissions definitions
import { PERMISSIONS, Permission } from '@/constants/permissions';

/**
 * Map each role to the set of permissions it should have.
 * You can still rely on hasAccess() for broad role-hierarchy checks,
 * but these are fine-grained permissions.
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.GUEST]: [],
  [ROLES.USER]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.EDIT_PROFILE],
  [ROLES.PREMIUM_USER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.MODIFY_SUBSCRIPTIONS,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.MANAGE_USERS,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ADMIN_PANEL,
  ],
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
};

/** Context shape */
interface PermissionsContextType {
  userRole: Role;
  /** Broad check: based on the ROLE_HIERARCHY */
  hasRoleAccess: (required: Role) => boolean;
  /** Fine-grained check: based on ROLE_PERMISSIONS mapping */
  hasPermission: (permission: Permission) => boolean;
}

/** Create & export the context */
const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

/** Hook to consume it */
export const usePermissions = (): PermissionsContextType => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('usePermissions must be inside a PermissionsProvider');
  }
  return ctx;
};

/** Provider props */
interface PermissionsProviderProps {
  children: ReactNode;
  role: Role;
}

/** The Provider itself */
export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children, role }) => {
  // Memoize to avoid re-creating functions each render
  const value = useMemo<PermissionsContextType>(
    () => ({
      userRole: role,

      /** Broad, role-hierarchy check */
      hasRoleAccess: (required: Role) => hasAccess(role, required),

      /** Fine-grained, permission check */
      hasPermission: (perm: Permission) => (ROLE_PERMISSIONS[role] || []).includes(perm),
    }),
    [role],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export default PermissionsProvider;
