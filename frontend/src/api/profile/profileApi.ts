// src/profile/profileApi.ts

import axios from 'axios';
import { http } from '@/utils/http';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  bio: string;
  interests: string[];
  profileImage: string;
  coverImage: string;
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [profileApi::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [profileApi::${fn}]`, error);
  }
}

/** GET /profile */
export async function fetchProfile(): Promise<ProfileData | null> {
  try {
    const resp = await http.get<ProfileData>('/profile');
    const data = resp.data;
    return {
      id:           data.id,
      name:         data.name ?? '',
      email:        data.email ?? '',
      bio:          data.bio ?? '',
      interests:    Array.isArray(data.interests) ? data.interests : [],
      profileImage: data.profileImage ?? '',
      coverImage:   data.coverImage ?? '',
    };
  } catch (err) {
    logError('fetchProfile', err);
    return null;
  }
}

/**
 * Unified update endpoint: accepts JSON fields or FormData for image uploads.
 */
export async function updateProfile(
  fields: Partial<Pick<ProfileData, 'bio' | 'interests'>> | FormData
): Promise<ProfileData | null> {
  try {
    let config;
    let body;
    if (fields instanceof FormData) {
      body = fields;
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    } else {
      body = fields;
      config = undefined;
    }
    const resp = await http.put<ProfileData>('/profile', body, config);
    const data = resp.data;
    return {
      id:           data.id,
      name:         data.name ?? '',
      email:        data.email ?? '',
      bio:          data.bio ?? '',
      interests:    Array.isArray(data.interests) ? data.interests : [],
      profileImage: data.profileImage ?? '',
      coverImage:   data.coverImage ?? '',
    };
  } catch (err) {
    logError('updateProfile', err);
    return null;
  }
}

/** Convenience wrappers */
export async function updateBio(newBio: string): Promise<ProfileData | null> {
  if (!newBio.trim()) {
    console.error('[profileApi] updateBio: bio cannot be empty');
    return null;
  }
  return updateProfile({ bio: newBio.trim() });
}

export async function updateInterests(newInterests: string[]): Promise<ProfileData | null> {
  return updateProfile({ interests: newInterests });
}

export async function uploadProfileImage(file: File): Promise<ProfileData | null> {
  if (!file) {
    console.error('[profileApi] uploadProfileImage: file is required');
    return null;
  }
  const form = new FormData();
  form.append('profileImage', file);
  return updateProfile(form);
}

export async function uploadCoverImage(file: File): Promise<ProfileData | null> {
  if (!file) {
    console.error('[profileApi] uploadCoverImage: file is required');
    return null;
  }
  const form = new FormData();
  form.append('coverImage', file);
  return updateProfile(form);
}

export default {
  fetchProfile,
  updateProfile,
  updateBio,
  updateInterests,
  uploadProfileImage,
  uploadCoverImage,
};
