// src/hooks/auth/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { http } from '@/utils/http';
import { API } from '@/constants/apiEndpoints';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthReturn {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'authToken';

export default function useAuth(): AuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null,
  );
  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  // Sync token ↔ sessionStorage & default header
  useEffect(() => {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      http.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      delete http.defaults.headers.common.Authorization;
      setUser(null);
    }
  }, [token]);

  // If a token exists, fetch current user
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const resp = await http.get<{ user: User }>(API.AUTH.REFRESH);
        setUser(resp.data.user);
        setError(null);
      } catch (err: unknown) {
        console.error('Failed to fetch current user:', err);
        setError('Session expired. Please log in again.');
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Login method
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const resp = await http.post<{ token: string; user: User }>(API.AUTH.LOGIN, {
        email,
        password,
      });
      setToken(resp.data.token);
      setUser(resp.data.user);
      return resp.data.user;
    } catch (err: unknown) {
      let msg = 'Invalid credentials.';
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, unknown>;
        if (typeof data.message === 'string') msg = data.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout method
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: Boolean(token),
  };
}
