// src/services/userPointsService.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { http } from '@/utils/http';

interface ApiErrorResponse {
  message: string;
}

// Retry helper expecting an AxiosResponse<T>
const axiosRetry = async <T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isServerErr =
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500;
      if (isServerErr && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
        attempt++;
        continue;
      }
      throw err;
    }
  }
  throw new Error('Failed after multiple retries.');
};

export interface PointsResponse {
  points: number;
}

const UserPointsService = {
  /** GET /users/:userId/points */
  async getUserPoints(userId: string): Promise<number> {
    const resp = await axiosRetry(() => http.get<PointsResponse>(`/users/${userId}/points`));
    return resp.data.points;
  },

  /** POST /users/:userId/points */
  async updateUserPoints(userId: string): Promise<number> {
    const resp = await axiosRetry(() => http.post<PointsResponse>(`/users/${userId}/points`, {}));
    return resp.data.points;
  },

  /** DELETE /users/:userId/points */
  async resetUserPoints(userId: string): Promise<void> {
    await axiosRetry(() => http.delete<void>(`/users/${userId}/points`));
  },
};

export default UserPointsService;
