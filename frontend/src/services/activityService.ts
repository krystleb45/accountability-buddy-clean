// src/services/activityService.ts
import { http } from '@/utils/http';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  isJoined: boolean;
  participants?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface PaginatedActivities {
  activities: Activity[];
  total: number;
}

const logError = (fn: string, err: unknown) => {
  console.error(`[activityService.${fn}]`, err);
};

/**
 * GET /api/activities?page=&limit=
 */
export async function listActivities(page = 1, limit = 10): Promise<PaginatedActivities> {
  try {
    const res = await http.get<{ success: boolean; data: PaginatedActivities }>(`/activities`, {
      params: { page, limit },
    });
    if (res.data.success) return res.data.data;
    console.error('[activityService.listActivities] unexpected response', res.data);
  } catch (err) {
    logError('listActivities', err);
  }
  return { activities: [], total: 0 };
}

/**
 * GET /api/activities/:id
 */
export async function getActivityDetails(id: string): Promise<Activity | null> {
  try {
    const res = await http.get<{ success: boolean; data: { activity: Activity } }>(
      `/activities/${id}`,
    );
    if (res.data.success) return res.data.data.activity;
  } catch (err) {
    logError('getActivityDetails', err);
  }
  return null;
}

/**
 * POST /api/activities/:id/join
 */
export async function joinActivity(id: string): Promise<boolean> {
  try {
    const res = await http.post<{ success: boolean }>(`/activities/${id}/join`);
    return res.data.success;
  } catch (err) {
    logError('joinActivity', err);
    return false;
  }
}

/**
 * POST /api/activities/:id/leave
 */
export async function leaveActivity(id: string): Promise<boolean> {
  try {
    const res = await http.post<{ success: boolean }>(`/activities/${id}/leave`);
    return res.data.success;
  } catch (err) {
    logError('leaveActivity', err);
    return false;
  }
}

/**
 * POST /api/activities
 */
export async function createActivity(payload: Partial<Activity>): Promise<Activity | null> {
  try {
    const res = await http.post<{ success: boolean; data: { activity: Activity } }>(
      `/activities`,
      payload,
    );
    if (res.data.success) return res.data.data.activity;
  } catch (err) {
    logError('createActivity', err);
  }
  return null;
}

/**
 * PUT /api/activities/:id
 */
export async function updateActivity(
  id: string,
  payload: Partial<Activity>,
): Promise<Activity | null> {
  try {
    const res = await http.put<{ success: boolean; data: { activity: Activity } }>(
      `/activities/${id}`,
      payload,
    );
    if (res.data.success) return res.data.data.activity;
  } catch (err) {
    logError('updateActivity', err);
  }
  return null;
}

/**
 * DELETE /api/activities/:id
 */
export async function deleteActivity(id: string): Promise<boolean> {
  try {
    const res = await http.delete<{ success: boolean }>(`/activities/${id}`);
    return res.data.success;
  } catch (err) {
    logError('deleteActivity', err);
    return false;
  }
}

export default {
  listActivities,
  getActivityDetails,
  joinActivity,
  leaveActivity,
  createActivity,
  updateActivity,
  deleteActivity,
};
