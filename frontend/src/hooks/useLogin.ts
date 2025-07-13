// src/hooks/useLogin.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import { setToken } from '@/services/authService';

interface UseLoginResult {
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
}

export function useLogin(): UseLoginResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<{ token: string }>('/api/auths/login', {
        email,
        password,
      });
      setToken(data.token);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Invalid credentials.');
      } else {
        setError('An unexpected error occurred.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, login };
}
