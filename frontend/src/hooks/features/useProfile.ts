// src/hooks/features/useProfile.ts
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { http } from '@/utils/http';
import { API } from '@/constants/apiEndpoints';
import type { User } from '@/types/User.types';

interface UseProfileReturn {
  profile: User | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  resetProfile: () => void;
}

const useProfile = (autoLoad = true): UseProfileReturn => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await http.get<User>(API.USER.PROFILE);
      setProfile(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // err.response?.data might be any, so we guard
        const message =
          (err.response?.data as { message?: string })?.message || 'Failed to fetch profile.';
        setError(message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updated: Partial<User>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await http.put<User>(API.USER.UPDATE, updated);
      setProfile(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string })?.message || 'Failed to update profile.';
        setError(message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      fetchProfile().catch(console.error);
    }
  }, [fetchProfile, autoLoad]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    resetProfile,
  };
};

export default useProfile;
export type { User };
