// src/gamification/gamificationApi.ts

import axios from 'axios';
import { http } from '@/utils/http';
import type { Badge, UserProgress } from '@/types/Gamification.types';

export interface LeaderboardEntry {
  profilePicture: string;
  userId: string;
  displayName: string;
  score: number;
}

export interface AvailableReward {
  id: string;
  name: string;
  cost: number;
  image?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

function logError(context: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [gamificationApi::${context}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [gamificationApi::${context}]`, error);
  }
}

// Fetch badges a user has earned
export async function fetchUserBadges(userId: string): Promise<Badge[]> {
  try {
    const resp = await http.get<Badge[]>(`/users/${encodeURIComponent(userId)}/badges`);
    return resp.data;
  } catch (error) {
    logError('fetchUserBadges', error);
    return [];
  }
}

// Fetch all badge definitions
export async function fetchAllBadges(): Promise<Badge[]> {
  try {
    const resp = await http.get<Badge[]>('/badges');
    return resp.data;
  } catch (error) {
    logError('fetchAllBadges', error);
    return [];
  }
}

// Fetch a user's progress
export async function fetchUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const resp = await http.get<UserProgress>(`/users/${encodeURIComponent(userId)}/progress`);
    return resp.data;
  } catch (error) {
    logError('fetchUserProgress', error);
    return null;
  }
}

// Fetch leaderboard entries + pagination
export async function fetchLeaderboard(
  page = 1,
  limit = 10,
): Promise<{ entries: LeaderboardEntry[]; pagination: Pagination } | null> {
  try {
    const resp = await http.get<{
      success: boolean;
      data: LeaderboardEntry[];
      pagination: Pagination;
    }>('/gamification/leaderboard', { params: { page, limit } });
    return {
      entries: resp.data.data,
      pagination: resp.data.pagination,
    };
  } catch (error) {
    logError('fetchLeaderboard', error);
    return null;
  }
}

// Award or add points
export async function addPoints(userId: string, points: number): Promise<boolean> {
  try {
    await http.post('/gamification/add-points', { userId, points });
    return true;
  } catch (error) {
    logError('addPoints', error);
    return false;
  }
}

// Fetch XP history
export async function fetchXPHistory(userId: string): Promise<{ date: string; xp: number }[]> {
  try {
    const resp = await http.get<{ history: { date: string; xp: number }[] }>(
      `/users/${encodeURIComponent(userId)}/xp-history`,
    );
    return resp.data.history;
  } catch (error) {
    logError('fetchXPHistory', error);
    return [];
  }
}

// Award a badge
export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    await http.post(`/users/${encodeURIComponent(userId)}/badges/${encodeURIComponent(badgeId)}`, {});
    return true;
  } catch (error) {
    logError('awardBadge', error);
    return false;
  }
}

// Fetch available rewards
export async function fetchAvailableRewards(): Promise<AvailableReward[]> {
  try {
    const resp = await http.get<{ rewards: AvailableReward[] }>('/rewards');
    return resp.data.rewards;
  } catch (error) {
    logError('fetchAvailableRewards', error);
    return [];
  }
}

export default {
  fetchUserBadges,
  fetchAllBadges,
  fetchUserProgress,
  fetchLeaderboard,
  addPoints,
  fetchXPHistory,
  awardBadge,
  fetchAvailableRewards,
};
