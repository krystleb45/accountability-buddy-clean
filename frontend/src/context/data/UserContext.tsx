// src/context/data/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { fetchUserProfile } from '@/api/users/userApi';
import type { UserProfile } from '@/types/User.types';

interface UserContextType {
  /** Partial because API may omit some properties */
  user: Partial<UserProfile> | null;
  loading: boolean;
  error: string | null;
  setUser: React.Dispatch<React.SetStateAction<Partial<UserProfile> | null>>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const profile = await fetchUserProfile(); // may return partial
        setUser(profile as Partial<UserProfile>);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load user profile.');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const logout = (): void => {
    setUser(null);
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
};
