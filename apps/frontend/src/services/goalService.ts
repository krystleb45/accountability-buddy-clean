// src/services/goalService.ts

import axios, { AxiosRequestConfig } from 'axios';
import { http } from '@/utils/http';

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  pinned: boolean;
  dueDate: string;    // <-- always a string now
  category: string;   // <-- always a string now
  [key: string]: unknown;
}

export interface GoalAnalytics {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  [key: string]: unknown;
}

const handleError = <T>(fn: string, error: unknown, fallback: T): T => {
  if (axios.isAxiosError(error) && error.response) {
    console.error(`❌ [goalService::${fn}]`, error.response.data?.message || error.message);
  } else {
    console.error(`❌ [goalService::${fn}]`, error);
  }
  return fallback;
};

function authConfig(token?: string): AxiosRequestConfig | undefined {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

// fallback undefined → ''
const od = (s: string | undefined | null): string => s ?? '';

// Helper to normalize API response to Goal interface
const normalizeGoal = (apiGoal: any): Goal => {
  console.log('🔄 Normalizing goal:', apiGoal);

  const normalized = {
    id: apiGoal.id || apiGoal._id,
    title: apiGoal.title || '',
    description: apiGoal.description || '',
    status: apiGoal.status || 'active',
    pinned: apiGoal.pinned || apiGoal.isPinned || false,
    progress: apiGoal.progress ?? 0,
    dueDate: od(apiGoal.dueDate || apiGoal.deadline), // Handle both field names
    category: apiGoal.category || '',
  };

  console.log('✅ Normalized result:', normalized);
  return normalized;
};

const GoalService = {
  /** POST /goals */
  async createGoal(
    goalData: Partial<Goal>,
    accessToken?: string
  ): Promise<Goal | undefined> {
    try {
      const { data: { data: g } } = await http.post<{ success: boolean; data: any }>(
        '/goals',
        goalData,
        authConfig(accessToken),
      );
      return normalizeGoal(g);
    } catch (err) {
      return handleError('createGoal', err, undefined);
    }
  },

  /** GET /goals */
  async getUserGoals(accessToken?: string): Promise<Goal[]|undefined> {
    try {
      const resp = await http.get<unknown>('/goals', authConfig(accessToken));
      const raw = resp.data as any;
      let list: any[] = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (Array.isArray(raw.data)) {
        list = raw.data;
      } else if (Array.isArray(raw.data?.goals)) {
        list = raw.data.goals;
      }
      return list.map(normalizeGoal);
    } catch (err) {
      return handleError('getUserGoals', err, undefined);
    }
  },

  /** PUT /goals/:goalId */
  async updateGoal(
    goalId: string,
    goalData: Partial<Goal>,
    accessToken?: string
  ): Promise<Goal|undefined> {
    try {
      // Transform frontend data to API format
      const apiData = {
        title: goalData.title,
        description: goalData.description,
        deadline: goalData.dueDate, // Convert dueDate to deadline for API
        category: goalData.category,
        status: goalData.status,
        progress: goalData.progress,
        pinned: goalData.pinned,
      };

      console.log('🔄 Sending to API:', apiData);

      const response = await http.put<any>(
        `/goals/${encodeURIComponent(goalId)}`,
        apiData,
        authConfig(accessToken),
      );

      console.log('✅ Full API Response:', response.data);

      // Handle the response structure - the goal might be in data.goal or data.data
      let goalFromResponse;
      if (response.data.goal) {
        goalFromResponse = response.data.goal;
      } else if (response.data.data) {
        goalFromResponse = response.data.data;
      } else {
        throw new Error('Unexpected response structure');
      }

      console.log('📋 Goal from response:', goalFromResponse);

      const normalized = normalizeGoal(goalFromResponse);
      console.log('🔄 Normalized goal:', normalized);

      return normalized;
    } catch (err) {
      return handleError('updateGoal', err, undefined);
    }
  },

  /** DELETE /goals/:goalId */
  async deleteGoal(goalId: string, accessToken?: string): Promise<boolean> {
    try {
      await http.delete(
        `/goals/${encodeURIComponent(goalId)}`,
        authConfig(accessToken),
      );
      return true;
    } catch (err) {
      handleError('deleteGoal', err, false);
      return false;
    }
  },

  /** GET /goals/:goalId */
  async getGoalDetails(goalId: string, accessToken?: string): Promise<Goal|undefined> {
    try {
      const { data: { data: g } } = await http.get<{ success: boolean; data: any }>(
        `/goals/${encodeURIComponent(goalId)}`,
        authConfig(accessToken),
      );
      console.log('📋 Goal details from API:', g);
      return normalizeGoal(g);
    } catch (err) {
      return handleError('getGoalDetails', err, undefined);
    }
  },

  /** GET /analytics/goals */
  async getGoalAnalytics(
    filters?: Record<string,unknown>,
    accessToken?: string
  ): Promise<GoalAnalytics|undefined> {
    try {
      const resp = await http.get<{ success: boolean; data: GoalAnalytics }>(
        '/analytics/goals',
        { params: filters, ...(authConfig(accessToken)||{}) },
      );
      return resp.data.data;
    } catch (err) {
      return handleError('getGoalAnalytics', err, undefined);
    }
  },
};

export default GoalService;
