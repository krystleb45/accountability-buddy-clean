// src/context/ui/NotificationContext.tsx
'use client';

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: Notification['type'], duration?: number) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const useNotification = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within <NotificationProvider>');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(clearTimeout);
      timeouts.current = {};
    };
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  }, []);

  const addNotification = useCallback(
    (message: string, type: Notification['type'] = 'info', duration: number = 5000) => {
      const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      setNotifications((prev) => [...prev, { id, message, type }]);

      // schedule removal
      timeouts.current[id] = setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification],
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    Object.values(timeouts.current).forEach(clearTimeout);
    timeouts.current = {};
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAllNotifications }}
    >
      {children}
      <div className="notification-container">
        {notifications.map(({ id, message, type }) => (
          <div key={id} className={`notification-banner ${type}`}>
            <span>{message}</span>
            <button onClick={() => removeNotification(id)} className="close-button">
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
