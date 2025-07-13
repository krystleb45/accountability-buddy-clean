// src/services/reportService.ts
import axios, { AxiosResponse } from 'axios';
import { http } from '@/utils/http';

export interface Report {
  id: string;
  userId: string;
  reportedId: string;
  reportType: 'post' | 'comment' | 'user';
  reason: string;
  status: 'pending' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  [key: string]: unknown;
}

interface ApiErrorResponse {
  message: string;
}

// Exponential‐backoff retry helper
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
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500;
      if (isServerError && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
        attempt++;
        continue;
      }
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  }
  throw new Error('Failed after multiple retries.');
}

const ReportService = {
  /** POST /reports */
  async createReport(
    reportedId: string,
    reportType: 'post' | 'comment' | 'user',
    reason: string,
  ): Promise<Report> {
    const resp = await retry(() =>
      http.post<{ success: boolean; report: Report }>('/reports', {
        reportedId,
        reportType,
        reason,
      }),
    );
    return resp.data.report;
  },

  /** GET /reports */
  async getAllReports(): Promise<Report[]> {
    const resp = await retry(() => http.get<{ success: boolean; reports: Report[] }>('/reports'));
    return resp.data.reports;
  },

  /** GET /reports/:id */
  async getReportById(id: string): Promise<Report> {
    if (!id.trim()) throw new Error('Report ID is required');
    const resp = await retry(() =>
      http.get<{ success: boolean; report: Report }>(`/reports/${encodeURIComponent(id)}`),
    );
    return resp.data.report;
  },

  /** PUT /reports/:id/resolve */
  async resolveReport(id: string): Promise<Report> {
    if (!id.trim()) throw new Error('Report ID is required');
    const resp = await retry(() =>
      http.put<{ success: boolean; report: Report }>(`/reports/${encodeURIComponent(id)}/resolve`),
    );
    return resp.data.report;
  },

  /** DELETE /reports/:id */
  async deleteReport(id: string): Promise<void> {
    if (!id.trim()) throw new Error('Report ID is required');
    await retry(() => http.delete(`/reports/${encodeURIComponent(id)}`));
  },
};

export default ReportService;
