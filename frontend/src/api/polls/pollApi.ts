// src/polls/pollApi.ts

import axios from 'axios';
import { http } from '@/utils/http';

export interface Poll {
  id: string;
  groupId: string;
  question: string;
  options: PollOption[];
  expirationDate: string;
  status: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  option: string;
  votes: string[];
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [pollApi::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [pollApi::${fn}]`, error);
  }
}

/** Fetch all polls in a group */
export async function fetchGroupPolls(groupId: string): Promise<Poll[]> {
  if (!groupId.trim()) return [];
  try {
    const resp = await http.get<Poll[]>(`/polls/groups/${encodeURIComponent(groupId)}/polls`);
    return resp.data;
  } catch (err) {
    logError('fetchGroupPolls', err);
    return [];
  }
}

/** Create a new poll */
export async function createPoll(
  groupId: string,
  question: string,
  options: string[],
  expirationDate: string,
): Promise<Poll | null> {
  if (!groupId.trim() || !question.trim() || options.length < 2 || !expirationDate) {
    console.error('[pollApi] createPoll: invalid arguments');
    return null;
  }
  try {
    const resp = await http.post<Poll>(
      `/polls/groups/${encodeURIComponent(groupId)}/polls`,
      { question, options, expirationDate }
    );
    return resp.data;
  } catch (err) {
    logError('createPoll', err);
    return null;
  }
}

/** Vote on a poll */
export async function votePoll(pollId: string, optionId: string): Promise<boolean> {
  if (!pollId.trim() || !optionId.trim()) return false;
  try {
    await http.post(`/polls/polls/${encodeURIComponent(pollId)}/vote`, { optionId });
    return true;
  } catch (err) {
    logError('votePoll', err);
    return false;
  }
}

/** Get poll results */
export async function fetchPollResults(
  pollId: string,
): Promise<{ option: string; votes: number }[]> {
  if (!pollId.trim()) return [];
  try {
    const resp = await http.get<{ results: { option: string; votes: number }[] }>(
      `/polls/polls/${encodeURIComponent(pollId)}/results`
    );
    return resp.data.results;
  } catch (err) {
    logError('fetchPollResults', err);
    return [];
  }
}

export default {
  fetchGroupPolls,
  createPoll,
  votePoll,
  fetchPollResults,
};
