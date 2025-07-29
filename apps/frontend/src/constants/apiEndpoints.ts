// src/constants/apiEndpoints.ts
export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/user-signup',    // ← CHANGED FROM '/api/auth/register'
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh-token',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/profile',
    DELETE: '/api/user/:userId',
    CHANGE_PASS: '/api/user/:userId/change-password',
  },
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    GET_BY_ID: '/api/tasks/:taskId',
    UPDATE: '/api/tasks/:taskId',
    DELETE: '/api/tasks/:taskId',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    READ: '/api/notifications/:notificationId/read',
    DELETE: '/api/notifications/:notificationId',
  },
  ADMIN: {
    STATS: '/api/admin/stats',
    USERS: '/api/admin/users',
    TASKS: '/api/admin/tasks',
  },
  FILES: {
    UPLOAD: '/api/files/upload',
    DOWNLOAD: '/api/files/:fileId/download',
    DELETE: '/api/files/:fileId',
  },
  MILITARY_SUPPORT: {
    LIST: '/military-support/resources',
    CREATE: '/military-support/resources',
    UPDATE: '/military-support/resources/:id',
    DELETE: '/military-support/resources/:id',
  },
} as const;

export type ApiEndpoints = typeof API;
