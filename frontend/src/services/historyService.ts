// src/services/historyService.ts
import axios from 'axios';
import { http } from '@/utils/http';

export interface HistoryRecord {
  _id: string;
  userId: string;
  entity: string;
  action: string;
  details?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Centralized error handler
const handleError = <T>(fn: string, error: unknown): ApiResponse<T> => {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [historyService::${fn}]`, error.response?.data || error.message);
    return {
      success: false,
      message: (error.response?.data as { message?: string })?.message ?? 'Server error',
    };
  } else {
    console.error(`❌ [historyService::${fn}]`, error);
    return {
      success: false,
      message: 'Unexpected error',
    };
  }
};

const HistoryService = {
  /** GET /history */
  async fetchAll(): Promise<ApiResponse<HistoryRecord[]>> {
    try {
      const resp = await http.get<HistoryRecord[]>('/history');
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('fetchAll', err);
    }
  },

  /** GET /history/:id */
  async fetchById(id: string): Promise<ApiResponse<HistoryRecord>> {
    if (!id) {
      return { success: false, message: 'History ID is required.' };
    }
    try {
      const resp = await http.get<HistoryRecord>(`/history/${encodeURIComponent(id)}`);
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('fetchById', err);
    }
  },

  /** POST /history */
  async create(
    entity: string,
    action: string,
    details?: string,
  ): Promise<ApiResponse<HistoryRecord>> {
    try {
      const resp = await http.post<HistoryRecord>('/history', {
        entity,
        action,
        details,
      });
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('create', err);
    }
  },

  /** DELETE /history/:id */
  async deleteById(id: string): Promise<ApiResponse<null>> {
    if (!id) {
      return { success: false, message: 'History ID is required.' };
    }
    try {
      await http.delete(`/history/${encodeURIComponent(id)}`);
      return { success: true };
    } catch (err) {
      return handleError('deleteById', err);
    }
  },

  /** DELETE /history/clear */
  async clearAll(): Promise<ApiResponse<null>> {
    try {
      await http.delete('/history/clear');
      return { success: true };
    } catch (err) {
      return handleError('clearAll', err);
    }
  },
};

export default HistoryService;
