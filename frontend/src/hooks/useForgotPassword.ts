// src/hooks/useForgotPassword.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

interface UseForgotPasswordResult {
  loading: boolean;
  error: string | null;
  success: string | null;
  reset: (email: string) => Promise<void>;
}

export function useForgotPassword(): UseForgotPasswordResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await axios.post<{ message?: string }>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`,
        { email },
      );
      setSuccess(data.message ?? 'Reset instructions sent. Check your inbox.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to send reset link.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, reset };
}
