// src/services/goalMessageService.ts
import axios from 'axios';
import { http } from '@/utils/http';

export interface GoalMessage {
  _id: string;
  goalId: string;
  userId: string;
  message: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const handleError = <T>(fn: string, error: unknown, fallback: ApiResponse<T>): ApiResponse<T> => {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [goalMessageService::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [goalMessageService::${fn}]`, error);
  }
  return fallback;
};

const GoalMessageService = {
  /** POST /goal-message/:goalId/send */
  async sendGoalMessage(goalId: string, message: string): Promise<ApiResponse<null>> {
    if (!goalId || !message.trim()) {
      return {
        success: false,
        message: 'Goal ID and non-empty message are required',
      };
    }
    try {
      await http.post(`/goal-message/${encodeURIComponent(goalId)}/send`, { message });
      return { success: true };
    } catch (err) {
      return handleError('sendGoalMessage', err, {
        success: false,
        message: 'Failed to send goal message',
      });
    }
  },

  /** GET /goal-message/:goalId/messages */
  async getGoalMessages(goalId: string): Promise<ApiResponse<GoalMessage[]>> {
    if (!goalId) {
      return {
        success: false,
        data: [],
        message: 'Goal ID is required',
      };
    }
    try {
      const resp = await http.get<GoalMessage[]>(
        `/goal-message/${encodeURIComponent(goalId)}/messages`,
      );
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('getGoalMessages', err, {
        success: false,
        data: [],
        message: 'Failed to load goal messages',
      });
    }
  },
};

export default GoalMessageService;
