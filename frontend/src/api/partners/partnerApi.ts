// src/partners/partnerApi.ts

import axios from 'axios';
import { http } from '@/utils/http';

export interface Partner {
  id: string;
  name: string;
  email: string;
  joinedAt?: string;
}

export interface Milestone {
  id: string;
  description: string;
  date: string;
  status?: string;
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message ?? error.message;
    console.error('[partnerApi] Error:', msg);
    throw new Error(msg);
  }
  console.error('[partnerApi] Unknown error:', error);
  throw new Error('An unknown error occurred');
}

/** POST /partners/notify */
export async function notifyPartner(
  partnerId: string,
  goal: string,
  milestone: Milestone,
): Promise<void> {
  if (!partnerId || !goal || !milestone) {
    throw new Error('partnerId, goal and milestone are required');
  }
  try {
    await http.post('/partners/notify', { partnerId, goal, milestone });
  } catch (err) {
    handleError(err);
  }
}

/** GET /partners/list */
export async function fetchPartners(): Promise<Partner[]> {
  try {
    const resp = await http.get<Partner[]>('/partners/list');
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

/** POST /partners/request */
export async function sendPartnerRequest(partnerId: string): Promise<void> {
  if (!partnerId) throw new Error('partnerId is required');
  try {
    await http.post('/partners/request', { partnerId });
  } catch (err) {
    handleError(err);
  }
}

/** POST /partners/accept/:requestId */
export async function acceptPartnerRequest(requestId: string): Promise<void> {
  if (!requestId) throw new Error('requestId is required');
  try {
    await http.post(`/partners/accept/${encodeURIComponent(requestId)}`);
  } catch (err) {
    handleError(err);
  }
}

/** POST /partners/decline/:requestId */
export async function declinePartnerRequest(requestId: string): Promise<void> {
  if (!requestId) throw new Error('requestId is required');
  try {
    await http.post(`/partners/decline/${encodeURIComponent(requestId)}`);
  } catch (err) {
    handleError(err);
  }
}

export default {
  notifyPartner,
  fetchPartners,
  sendPartnerRequest,
  acceptPartnerRequest,
  declinePartnerRequest,
};
