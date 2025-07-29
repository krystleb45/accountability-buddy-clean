// src/context/GlobalContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { THEME_CONSTANTS } from '@/constants/themeConstants';
import { UI_CONSTANTS } from '@/constants/uiConstants';

type ThemeKey = keyof typeof THEME_CONSTANTS;

interface NotificationType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface GlobalContextType {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  notifications: NotificationType[];
  addNotification: (message: string, type?: NotificationType['type'], durationMs?: number) => void;
  removeNotification: (id: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/** Hook to consume our global state */
export const useGlobal = (): GlobalContextType => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobal must be used within a GlobalProvider');
  return ctx;
};

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  // Theme: default from localStorage or 'DARK_MODE' if none
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    const stored = localStorage.getItem('theme') as ThemeKey | null;
    if (stored && THEME_CONSTANTS[stored]) return stored;
    return 'DARK_MODE';
  });

  // Sidebar open state, persisted
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    return localStorage.getItem('sidebarOpen') === 'true';
  });

  // Notifications list
  const [notifications, setNotifications] = useState<NotificationType[]>(() => {
    const raw = localStorage.getItem('notifications');
    return raw ? JSON.parse(raw) : [];
  });

  // Persist theme & sidebar to localStorage & apply CSS vars
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const vars = THEME_CONSTANTS[theme];
    Object.entries(vars).forEach(([key, val]) =>
      document.documentElement.style.setProperty(key, val),
    );
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const setTheme = useCallback((newTheme: ThemeKey) => {
    if (THEME_CONSTANTS[newTheme]) setThemeState(newTheme);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((o) => !o);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message: string, type: NotificationType['type'] = 'info', durationMs: number = 5000) => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);

      setTimeout(() => removeNotification(id), durationMs);
    },
    [removeNotification],
  );

  return (
    <GlobalContext.Provider
      value={{
        theme,
        setTheme,
        notifications,
        addNotification,
        removeNotification,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
      {/* Render notification banners */}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded px-4 py-2 shadow ${
              {
                success: 'bg-green-500',
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500',
              }[n.type]
            } flex items-center justify-between`}
          >
            <span className="mr-2">{UI_CONSTANTS.ICONS[n.type.toUpperCase() as 'INFO']}</span>
            <span>{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              aria-label={UI_CONSTANTS.BUTTON_LABELS.CLOSE}
              className="ml-4 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
