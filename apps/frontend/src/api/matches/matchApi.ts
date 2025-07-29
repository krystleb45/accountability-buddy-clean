// src/matches/matchApi.ts

import axios from 'axios';
import { http } from '@/utils/http';

export interface Match {
  id: string;
  user1: string;
  user2: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  totalMatches: number;
  currentPage: number;
  totalPages: number;
}

export interface MatchListResponse {
  matches: Match[];
  pagination: Pagination;
}

const logErr = (fn: string, error: unknown): void => {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [matchApi::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [matchApi::${fn}]`, error);
  }
};

/** Create a new match */
export async function createMatch(
  user1: string,
  user2: string,
  status = 'pending',
): Promise<Match | null> {
  try {
    const resp = await http.post<Match>('/matches', { user1, user2, status });
    return resp.data;
  } catch (err) {
    logErr('createMatch', err);
    return null;
  }
}

/** List matches (paginated) */
export async function listMatches(page = 1, limit = 10): Promise<MatchListResponse> {
  try {
    const resp = await http.get<MatchListResponse>('/matches', {
      params: { page, limit },
    });
    return resp.data;
  } catch (err) {
    logErr('listMatches', err);
    return { matches: [], pagination: { totalMatches: 0, currentPage: page, totalPages: 0 } };
  }
}

/** Fetch a match by ID */
export async function fetchMatchById(matchId: string): Promise<Match | null> {
  if (!matchId) return null;
  try {
    const resp = await http.get<Match>(`/matches/${encodeURIComponent(matchId)}`);
    return resp.data;
  } catch (err) {
    logErr('fetchMatchById', err);
    return null;
  }
}

/** Update a match’s status */
export async function updateMatchStatus(matchId: string, status: string): Promise<Match | null> {
  if (!matchId) return null;
  try {
    const resp = await http.patch<Match>(
      `/matches/${encodeURIComponent(matchId)}/status`,
      { status },
    );
    return resp.data;
  } catch (err) {
    logErr('updateMatchStatus', err);
    return null;
  }
}

/** Delete a match */
export async function deleteMatch(matchId: string): Promise<boolean> {
  if (!matchId) return false;
  try {
    await http.delete(`/matches/${encodeURIComponent(matchId)}`);
    return true;
  } catch (err) {
    logErr('deleteMatch', err);
    return false;
  }
}

export default {
  createMatch,
  listMatches,
  fetchMatchById,
  updateMatchStatus,
  deleteMatch,
};
