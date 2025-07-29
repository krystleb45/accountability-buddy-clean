// src/services/auditService.ts
import { http } from '@/utils/http';
import { getAuthHeader } from './authService';
import { AxiosHeaders } from 'axios';

http.interceptors.request.use((config) => {
  // grab just the token header string, if any
  const { Authorization } = getAuthHeader();
  if (Authorization) {
    // take whatever headers you already had (plain object or AxiosHeaders),
    // wrap it in an AxiosHeaders instance, then set our Authorization
    config.headers = AxiosHeaders.from(config.headers).set('Authorization', Authorization);
  }
  return config;
});

// Mirror your backend’s AuditLog shape
export interface AuditLog {
  id: string;
  action: string;
  description?: string;
  userId: string;
  ipAddress?: string;
  createdAt: string;
}

export default {
  /** POST /api/audit/log */
  async log(action: string, details?: string): Promise<void> {
    await http.post<{ success: boolean }>('/audit/log', { action, details });
  },

  /** GET /api/audit */
  async fetchAll(): Promise<AuditLog[]> {
    const resp = await http.get<{ success: boolean; logs: AuditLog[] }>('/audit');
    return resp.data.logs;
  },

  /** GET /api/audit/user/:userId */
  async fetchByUser(userId: string): Promise<AuditLog[]> {
    const resp = await http.get<{ success: boolean; logs: AuditLog[] }>(
      `/audit/user/${userId}`
    );
    return resp.data.logs;
  },
};
