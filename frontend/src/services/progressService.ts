// src/services/progressService.ts
import { http } from '@/utils/http';

export interface GoalProgress {
  _id: string;
  title: string;
  progress: number;
  status: string;
  dueDate?: string;
}

export interface ProgressData {
  goals: GoalProgress[];
}

export interface UpdateProgressResponse {
  goal: GoalProgress;
}

export interface ResetProgressResponse {
  modifiedCount: number;
}

class ProgressService {
  /**
   * GET /progress
   */
  static async getProgress(): Promise<ProgressData> {
    try {
      const resp = await http.get<{ success: boolean; data: ProgressData }>(
        '/progress'
      );
      return resp.data.data;
    } catch (err) {
      console.error('[ProgressService.getProgress] failed:', err);
      throw new Error('Failed to fetch progress.');
    }
  }

  /**
   * PUT /progress/update
   */
  static async updateProgress(
    goalId: string,
    progress: number
  ): Promise<UpdateProgressResponse> {
    if (!goalId.trim() || progress < 0 || progress > 100) {
      throw new Error('Invalid goalId or progress value.');
    }
    try {
      const resp = await http.put<{
        success: boolean;
        data: UpdateProgressResponse;
      }>('/progress/update', { goalId, progress });
      return resp.data.data;
    } catch (err) {
      console.error('[ProgressService.updateProgress] failed:', err);
      throw new Error('Failed to update progress.');
    }
  }

  /**
   * DELETE /progress/reset
   */
  static async resetProgress(): Promise<ResetProgressResponse> {
    try {
      const resp = await http.delete<{
        success: boolean;
        data: ResetProgressResponse;
      }>('/progress/reset');
      return resp.data.data;
    } catch (err) {
      console.error('[ProgressService.resetProgress] failed:', err);
      throw new Error('Failed to reset progress.');
    }
  }
}

export default ProgressService;
