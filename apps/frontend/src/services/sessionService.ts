// src/services/sessionService.ts
import { http } from '@/utils/http';

export interface Session {
  _id: string;
  user: {
    _id: string;
    email: string;
    username?: string;
    [key: string]: unknown;
  };
  token: string;
  ipAddress: string;
  device: string;
  expiresAt: string;
  isActive: boolean;
  [key: string]: unknown;
}

const SessionService = {
  /** POST /session/login */
  async login(email: string, password: string): Promise<{ token: string; sessionId: string }> {
    const resp = await http.post<{ success: boolean; token: string; sessionId: string }>(
      '/session/login',
      { email, password },
    );
    if (!resp.data.success) {
      throw new Error('Login failed');
    }
    return { token: resp.data.token, sessionId: resp.data.sessionId! };
  },

  /** POST /session/logout */
  async logout(): Promise<void> {
    const resp = await http.post<{ success: boolean; message?: string }>('/session/logout');
    if (!resp.data.success) {
      throw new Error(resp.data.message || 'Logout failed');
    }
  },

  /** DELETE /session/all */
  async deleteAllSessions(currentSessionId: string): Promise<void> {
    const resp = await http.delete<{ success: boolean; message?: string }>('/session/all', {
      data: { sessionId: currentSessionId },
    });
    if (!resp.data.success) {
      throw new Error(resp.data.message || 'Failed to delete all sessions');
    }
  },

  /** POST /session/refresh */
  async refresh(): Promise<string> {
    const resp = await http.post<{ success: boolean; token: string }>('/session/refresh');
    if (!resp.data.success) {
      throw new Error('Failed to refresh session');
    }
    return resp.data.token;
  },

  /** GET /session/:id */
  async getSession(sessionId: string): Promise<Session> {
    const resp = await http.get<{ success: boolean; data: Session }>(`/session/${sessionId}`);
    if (!resp.data.success) {
      throw new Error('Failed to fetch session');
    }
    return resp.data.data!;
  },

  /** GET /session */
  async getUserSessions(): Promise<Session[]> {
    const resp = await http.get<{ success: boolean; data: Session[] }>('/session');
    if (!resp.data.success) {
      throw new Error('Failed to fetch user sessions');
    }
    return resp.data.data!;
  },

  /** DELETE /session/:id */
  async deleteSession(sessionId: string): Promise<void> {
    const resp = await http.delete<{ success: boolean; message?: string }>(`/session/${sessionId}`);
    if (!resp.data.success) {
      throw new Error(resp.data.message || 'Failed to delete session');
    }
  },
};

export default SessionService;
