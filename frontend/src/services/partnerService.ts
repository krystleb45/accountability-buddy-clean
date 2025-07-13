// src/services/partnerService.ts
import axios, { AxiosResponse } from 'axios'; // Removed unused AxiosError import
import { http } from '@/utils/http';

export interface Partner {
  id: string;
  name: string;
  email: string;
  joinedAt?: string;
  [key: string]: unknown;
}

export interface Milestone {
  id: string;
  description: string;
  date: string;
  status?: string;
  [key: string]: unknown;
}

// retry helper with exponential backoff
async function retry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isServer =
        axios.isAxiosError(err) && err.response?.status !== undefined && err.response.status >= 500;
      if (isServer && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
        attempt++;
        continue;
      }
      // rethrow client errors or last attempt
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || err.message);
      }
      throw err;
    }
  }
  throw new Error('Failed after multiple retries.');
}

const PartnerService = {
  /** Notify a partner about a milestone */
  async notifyPartner(partnerId: string, goal: string, milestone: Milestone): Promise<void> {
    if (!partnerId || !goal || !milestone) {
      throw new Error('partnerId, goal and milestone are required');
    }
    await retry(() => http.post('/partners/notify', { partnerId, goal, milestone }));
  },

  /** List all partners */
  async fetchPartners(): Promise<Partner[]> {
    const resp = await retry(() => http.get<Partner[]>('/partners/list'));
    return resp.data;
  },

  /** Send a partnership request */
  async sendPartnerRequest(partnerId: string): Promise<void> {
    if (!partnerId) throw new Error('partnerId is required');
    await retry(() => http.post('/partners/request', { partnerId }));
  },

  /** Accept an incoming partner request */
  async acceptPartnerRequest(requestId: string): Promise<void> {
    if (!requestId) throw new Error('requestId is required');
    await retry(() => http.post(`/partners/accept/${encodeURIComponent(requestId)}`));
  },

  /** Decline an incoming partner request */
  async declinePartnerRequest(requestId: string): Promise<void> {
    if (!requestId) throw new Error('requestId is required');
    await retry(() => http.post(`/partners/decline/${encodeURIComponent(requestId)}`));
  },
};

export default PartnerService;
