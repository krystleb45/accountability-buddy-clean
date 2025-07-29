// src/services/milestoneService.ts
import axios from 'axios';
import { http } from '@/utils/http';

export interface Milestone {
  _id: string;
  user: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T | undefined;
  message?: string;
}

const handleError = <T>(fn: string, error: unknown, fallback: ApiResponse<T>): ApiResponse<T> => {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [milestoneService::${fn}]`, error.response?.data || error.message);
    return {
      success: false,
      message: (error.response?.data as { message?: string })?.message || error.message,
      data: fallback.data,
    };
  }
  console.error(`❌ [milestoneService::${fn}]`, error);
  return fallback;
};

const MilestoneService = {
  /** GET /milestones */
  async fetchMilestones(): Promise<ApiResponse<Milestone[]>> {
    try {
      const resp = await http.get<Milestone[]>('/milestones');
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('fetchMilestones', err, { success: false, data: [] });
    }
  },

  /** POST /milestones/add */
  async addMilestone(
    title: string,
    dueDate: string,
    description?: string,
  ): Promise<ApiResponse<Milestone>> {
    try {
      const resp = await http.post<Milestone>('/milestones/add', {
        title,
        description,
        dueDate,
      });
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('addMilestone', err, { success: false });
    }
  },

  /** PUT /milestones/update */
  async updateMilestone(
    milestoneId: string,
    updates: Partial<Pick<Milestone, 'title' | 'description' | 'dueDate'>>,
  ): Promise<ApiResponse<Milestone>> {
    try {
      const resp = await http.put<Milestone>('/milestones/update', {
        milestoneId,
        updates,
      });
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('updateMilestone', err, { success: false });
    }
  },

  /** DELETE /milestones/delete */
  async deleteMilestone(milestoneId: string): Promise<ApiResponse<null>> {
    try {
      const resp = await http.delete<{ success: boolean }>('/milestones/delete', {
        data: { milestoneId },
      });
      return { success: resp.data.success };
    } catch (err) {
      return handleError('deleteMilestone', err, { success: false });
    }
  },
};

export default MilestoneService;
export type { ApiResponse };
