// src/hooks/features/useNotifications.ts
import { useCallback } from 'react';
import { useNotification } from '@/context/ui/NotificationContext';
import notificationConfig from '@/config/notifications/notificationConfig';

export interface UseNotificationsReturn {
  notifications: {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }[];
  addNotification: (
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error',
    duration?: number,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export default function useNotifications(): UseNotificationsReturn {
  const { notifications, addNotification, removeNotification, clearAllNotifications } =
    useNotification();

  const wrappedAdd = useCallback(
    (
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info',
      duration?: number,
    ) => {
      // pull default duration from config if none passed
      const { duration: defaultDur } = notificationConfig.getConfig(type);
      addNotification(message, type, duration ?? defaultDur);
    },
    [addNotification],
  );

  return {
    notifications,
    addNotification: wrappedAdd,
    removeNotification,
    clearNotifications: clearAllNotifications,
  };
}
