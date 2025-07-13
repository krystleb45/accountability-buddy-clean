// src/progress/progressApi.ts

import axios from 'axios';
import { http } from '@/utils/http';
import type {
  GoalProgress,
  ProgressData,
  UpdateProgressResponse,
  ResetProgressResponse,
} from '@/services/progressService';

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [progressApi::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [progressApi::${fn}]`, error);
  }
}

/** Fetch the current user's progress */
export async function fetchProgress(): Promise<GoalProgress[]> {
  try {
    const resp = await http.get<ProgressData>('/progress');
    return resp.data.goals;
  } catch (err) {
    logError('fetchProgress', err);
    return [];
  }
}

/** Update a single goal's progress */
export async function updateProgress(
  goalId: string,
  progress: number,
): Promise<GoalProgress | null> {
  if (!goalId.trim() || progress < 0 || progress > 100) {
    console.error('[progressApi] updateProgress: invalid arguments');
    return null;
  }
  try {
    const resp = await http.put<UpdateProgressResponse>('/progress/update', {
      goalId,
      progress,
    });
    return resp.data.goal;
  } catch (err) {
    logError('updateProgress', err);
    return null;
  }
}

/** Reset all goals' progress */
export async function resetProgress(): Promise<number> {
  try {
    const resp = await http.delete<ResetProgressResponse>('/progress/reset');
    return resp.data.modifiedCount;
  } catch (err) {
    logError('resetProgress', err);
    return 0;
  }
}

export default {
  fetchProgress,
  updateProgress,
  resetProgress,
};
