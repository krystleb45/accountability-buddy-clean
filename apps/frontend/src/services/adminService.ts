// src/api/admin/adminService.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { http } from '@/utils/http';
import { getAuthHeader } from '@/services/authService';

// ——— Type Definitions —————————————————————————————————————————————
export interface User {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}
export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  reports: number;
}
export interface Report {
  id: string;
  contentId: string;
  reason: string;
  status: string;
  createdAt: string;
}
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ——— Request Interceptor ———————————————————————————————————————————
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthHeader().token;
    if (token) {
      // Wrap whatever headers exist into an AxiosHeaders
      const hdrs = new AxiosHeaders(config.headers as AxiosHeaders);
      // Set Authorization as a string
      hdrs.set('Authorization', token);
      // Assign it back
      config.headers = hdrs;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

// ——— Uniform Error Handler ————————————————————————————————————————
function handleApiError<T>(error: unknown): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    console.error('[adminService] API Error:', error.response?.data || error.message);
    return {
      success: false,
      message:
        (error.response?.data as { message?: string })?.message || 'An unexpected error occurred.',
    };
  }
  console.error('[adminService] Unknown Error:', error);
  return { success: false, message: 'An unexpected error occurred.' };
}

// ——— AdminService —————————————————————————————————————————————————
const AdminService = {
  async listUsers(page = 1, limit = 10): Promise<ApiResponse<{ users: User[]; total: number }>> {
    try {
      const resp = await http.get<{ users: User[]; total: number }>('/admin/users', {
        params: { page, limit },
      });
      return { success: true, data: resp.data };
    } catch (err) {
      return handleApiError(err);
    }
  },

  async blockUser(userId: string): Promise<ApiResponse<null>> {
    try {
      await http.post(`/admin/users/${userId}/block`);
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  },

  async unblockUser(userId: string): Promise<ApiResponse<null>> {
    try {
      await http.post(`/admin/users/${userId}/unblock`);
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  },

  async getAnalytics(): Promise<ApiResponse<Analytics>> {
    try {
      const resp = await http.get<Analytics>('/admin/analytics');
      return { success: true, data: resp.data };
    } catch (err) {
      return handleApiError(err);
    }
  },

  async listReports(
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<{ reports: Report[]; total: number }>> {
    try {
      const resp = await http.get<{ reports: Report[]; total: number }>('/admin/reports', {
        params: { page, limit },
      });
      return { success: true, data: resp.data };
    } catch (err) {
      return handleApiError(err);
    }
  },

  async handleReport(reportId: string, action: string): Promise<ApiResponse<null>> {
    try {
      await http.post(`/admin/reports/${reportId}`, { action });
      return { success: true };
    } catch (err) {
      return handleApiError(err);
    }
  },
};

export default AdminService;
