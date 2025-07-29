// src/services/rewardService.ts
import axios, { AxiosResponse } from 'axios';
import { http } from '@/utils/http';

export interface Reward {
  id: string;
  title: string;
  description?: string;
  pointsRequired: number;
  rewardType: string;
  imageUrl?: string;
  createdAt: string;
  [key: string]: unknown;
}

interface ApiError {
  message: string;
}

// Exponential-backoff retry helper
async function retry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isServerError =
        axios.isAxiosError<ApiError>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500;
      if (isServerError && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
        attempt++;
        continue;
      }
      if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  }
  throw new Error('Failed after multiple retries.');
}

const RewardService = {
  /** GET /rewards */
  async getUserRewards(): Promise<Reward[]> {
    const resp = await retry(() => http.get<Reward[]>('/rewards'));
    return resp.data;
  },

  /** POST /rewards/:id/redeem */
  async redeemReward(rewardId: string): Promise<Reward> {
    if (!rewardId.trim()) throw new Error('Reward ID is required');
    const resp = await retry(() =>
      http.post<Reward>(`/rewards/${encodeURIComponent(rewardId)}/redeem`),
    );
    return resp.data;
  },

  /** POST /rewards */
  async createReward(
    title: string,
    pointsRequired: number,
    rewardType: string,
    description?: string,
    imageUrl?: string,
  ): Promise<Reward> {
    if (!title.trim() || pointsRequired < 0 || !rewardType.trim()) {
      throw new Error('Title, pointsRequired, and rewardType are required');
    }
    const payload = { title, pointsRequired, rewardType, description, imageUrl };
    const resp = await retry(() => http.post<Reward>('/rewards', payload));
    return resp.data;
  },
};

export default RewardService;
