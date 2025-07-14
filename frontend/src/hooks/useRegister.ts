// src/hooks/useRegister.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface UseRegisterResult {
  loading: boolean;
  error: string | null;
  success: string | null;
  register: (payload: RegisterPayload) => Promise<void>;
}

export function useRegister(): UseRegisterResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const register = useCallback(async ({ name, email, password }: RegisterPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await axios.post<{ message?: string }>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
        { name, email, password },
      );
      setSuccess(data.message ?? 'Registration successful!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Registration failed.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, register };
}
