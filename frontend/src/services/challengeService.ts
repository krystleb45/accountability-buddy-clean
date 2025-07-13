// src/services/challengeService.ts
import axios from 'axios';
import { http } from '@/utils/http';

export interface Milestone {
  label: string;
  target: number;
}

export interface Challenge {
  id: string;
  name: string;
  type: 'weekly' | 'monthly';
  description?: string;
  visibility: 'public' | 'private';
  milestones: Milestone[];
  participants?: { user: string; progress: number; joinedAt: string }[];
  createdAt?: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const handleError = <T>(fn: string, error: unknown, fallback: T): T => {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [challengeService::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [challengeService::${fn}]`, error);
  }
  return fallback;
};

const challengeService = {
  /** POST /challenge */
  async createChallenge(payload: {
    name: string;
    type: 'weekly' | 'monthly';
    description?: string;
    visibility: 'public' | 'private';
    milestones: Milestone[];
  }): Promise<ApiResponse<{ challenge: Challenge }>> {
    try {
      const res = await http.post<{ challenge: Challenge }>('/challenge', payload);
      return { success: true, data: res.data };
    } catch (err) {
      return handleError('createChallenge', err, {
        success: false,
        message: 'Failed to create challenge',
      });
    }
  },

  /** GET /challenge/public */
  async getPublicChallenges(
    page = 1,
    pageSize = 10,
    status?: string,
  ): Promise<ApiResponse<{ challenges: Challenge[] }>> {
    try {
      const res = await http.get<{ challenges: Challenge[] }>('/challenge/public', {
        params: { page, pageSize, status },
      });
      return { success: true, data: res.data };
    } catch (err) {
      return handleError('getPublicChallenges', err, {
        success: false,
        message: 'Failed to fetch public challenges',
      });
    }
  },

  /** POST /challenge/join */
  async joinChallenge(challengeId: string): Promise<ApiResponse<null>> {
    try {
      const res = await http.post<ApiResponse<null>>('/challenge/join', { challengeId });
      return res.data;
    } catch (err) {
      return handleError('joinChallenge', err, {
        success: false,
        message: 'Failed to join challenge',
      });
    }
  },

  /** POST /challenge/leave */
  async leaveChallenge(challengeId: string): Promise<ApiResponse<null>> {
    try {
      const res = await http.post<ApiResponse<null>>('/challenge/leave', { challengeId });
      return res.data;
    } catch (err) {
      return handleError('leaveChallenge', err, {
        success: false,
        message: 'Failed to leave challenge',
      });
    }
  },

  /** GET /challenge/:id */
  async getChallengeById(id: string): Promise<ApiResponse<{ challenge: Challenge }>> {
    if (!id) {
      return { success: false, message: 'Challenge ID is required' };
    }
    try {
      const res = await http.get<{ challenge: Challenge }>(`/challenge/${id}`);
      return { success: true, data: res.data };
    } catch (err) {
      return handleError('getChallengeById', err, {
        success: false,
        message: 'Failed to fetch challenge',
      });
    }
  },
};

export default challengeService;
