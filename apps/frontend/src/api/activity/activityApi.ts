// src/activity/activityApi.ts
import axios from 'axios'; // only for type‐guards
import { http } from '@/utils/http';

export interface Activity {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  completed: boolean;
  likes: number;
  comments: unknown[];
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}
interface ErrorResponse {
  success: false;
  message: string;
}

const logApiError = (fn: string, err: unknown): void => {
  if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
    console.error(`[activityApi][${fn}]`, err.response.data.message);
  } else {
    console.error(`[activityApi][${fn}]`, err);
  }
};

/** GET /activities */
export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const res = await http.get<SuccessResponse<{ activities: Activity[] }>>(
      '/activities'
    );
    return res.data.data.activities;
  } catch (err) {
    logApiError('fetchActivities', err);
    return [];
  }
};

/** GET /activities/:id */
export const fetchActivityById = async (id: string): Promise<Activity | null> => {
  try {
    const res = await http.get<SuccessResponse<{ activity: Activity }>>(
      `/activities/${encodeURIComponent(id)}`
    );
    return res.data.data.activity;
  } catch (err) {
    logApiError('fetchActivityById', err);
    return null;
  }
};

/** POST /activities */
export const createActivity = async (
  title: string,
  description?: string
): Promise<Activity | null> => {
  try {
    const res = await http.post<SuccessResponse<{ activity: Activity }>>(
      '/activities',
      { title, description }
    );
    return res.data.data.activity;
  } catch (err) {
    logApiError('createActivity', err);
    return null;
  }
};

/** PUT /activities/:id */
export const updateActivity = async (
  id: string,
  payload: Partial<Pick<Activity, 'title' | 'description' | 'completed'>>
): Promise<Activity | null> => {
  try {
    const res = await http.put<SuccessResponse<{ activity: Activity }>>(
      `/activities/${encodeURIComponent(id)}`,
      payload
    );
    return res.data.data.activity;
  } catch (err) {
    logApiError('updateActivity', err);
    return null;
  }
};

/** PATCH /activities/:id/status */
export const toggleActivityStatus = async (id: string, completed: boolean): Promise<boolean> => {
  try {
    const res = await http.patch<SuccessResponse<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}/status`,
      { completed }
    );
    return res.data.success;
  } catch (err) {
    logApiError('toggleActivityStatus', err);
    return false;
  }
};

/** DELETE /activities/:id */
export const deleteActivity = async (id: string): Promise<boolean> => {
  try {
    const res = await http.delete<SuccessResponse<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}`
    );
    return res.data.success;
  } catch (err) {
    logApiError('deleteActivity', err);
    return false;
  }
};

/** POST /activities/:id/like */
export const likeActivity = async (id: string): Promise<boolean> => {
  try {
    const res = await http.post<SuccessResponse<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}/like`
    );
    return res.data.success;
  } catch (err) {
    logApiError('likeActivity', err);
    return false;
  }
};
