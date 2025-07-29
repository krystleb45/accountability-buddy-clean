// src/history/historyApi.ts

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

/** Fetch all history records */
export async function fetchHistory(): Promise<HistoryRecord[]> {
  try {
    const resp = await http.get<HistoryRecord[]>('/history');
    return resp.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[historyApi::fetchHistory]', err.response?.data || err.message);
    } else {
      console.error('[historyApi::fetchHistory]', err);
    }
    return [];
  }
}

/** Fetch a single history record by ID */
export async function fetchHistoryById(id: string): Promise<HistoryRecord | null> {
  if (!id) return null;
  try {
    const resp = await http.get<HistoryRecord>(`/history/${encodeURIComponent(id)}`);
    return resp.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[historyApi::fetchHistoryById]', err.response?.data || err.message);
    } else {
      console.error('[historyApi::fetchHistoryById]', err);
    }
    return null;
  }
}

/** Create a new history record */
export async function createHistoryRecord(
  entity: string,
  action: string,
  details?: string,
): Promise<HistoryRecord | null> {
  try {
    const resp = await http.post<HistoryRecord>('/history', { entity, action, details });
    return resp.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[historyApi::createHistoryRecord]', err.response?.data || err.message);
    } else {
      console.error('[historyApi::createHistoryRecord]', err);
    }
    return null;
  }
}

/** Delete a history record by ID */
export async function deleteHistoryById(id: string): Promise<boolean> {
  if (!id) return false;
  try {
    await http.delete(`/history/${encodeURIComponent(id)}`);
    return true;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[historyApi::deleteHistoryById]', err.response?.data || err.message);
    } else {
      console.error('[historyApi::deleteHistoryById]', err);
    }
    return false;
  }
}

/** Clear all history records */
export async function clearHistory(): Promise<boolean> {
  try {
    await http.delete('/history/clear');
    return true;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('[historyApi::clearHistory]', err.response?.data || err.message);
    } else {
      console.error('[historyApi::clearHistory]', err);
    }
    return false;
  }
}

export default {
  fetchHistory,
  fetchHistoryById,
  createHistoryRecord,
  deleteHistoryById,
  clearHistory,
};
