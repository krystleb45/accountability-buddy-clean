// src/context/auth/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { http } from '@/utils/http';
import { ROUTES } from '@/constants/routePaths';
import { STORAGE_KEYS } from '@/constants/storageKeys';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Persist token
  useEffect(() => {
    if (token) sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    else sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }, [token]);

  // Auto-attach token to every http request
  useEffect(() => {
    const id = http.interceptors.request.use((config) => {
      if (token) config.headers!['Authorization'] = `Bearer ${token}`;
      return config;
    });
    return () => http.interceptors.request.eject(id);
  }, [token]);

  // Load current user
  const refreshUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await http.get<{ user: User }>('/auth/me');
      setUser({
        ...data.user,
        avatarUrl: data.user.avatarUrl || '/default-avatar.png',
      });
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) refreshUser();
  }, [token]);

  // Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await http.post<{
        token: string;
        user: User;
      }>('/auth/login', { email, password });
      setToken(data.token);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || 'Login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    router.replace(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
};
