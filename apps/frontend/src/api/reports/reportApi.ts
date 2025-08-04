// src/reports/reportApi.ts

import axios from "axios"

import { http } from "@/utils/http"

export interface Report {
  id: string
  userId: string
  reportedId: string
  reportType: "post" | "comment" | "user"
  reason: string
  status: "pending" | "resolved"
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [reportApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [reportApi::${fn}]`, error)
  }
}

/** POST /reports */
export async function submitReport(
  reportedId: string,
  reportType: "post" | "comment" | "user",
  reason: string,
): Promise<Report | null> {
  try {
    const resp = await http.post<Report>("/reports", {
      reportedId,
      reportType,
      reason,
    })
    return resp.data
  } catch (err) {
    logError("submitReport", err)
    return null
  }
}

/** GET /reports */
export async function fetchReports(): Promise<Report[]> {
  try {
    const resp = await http.get<Report[]>("/reports")
    return resp.data
  } catch (err) {
    logError("fetchReports", err)
    return []
  }
}

/** GET /reports/:id */
export async function fetchReportById(id: string): Promise<Report | null> {
  if (!id.trim()) return null
  try {
    const resp = await http.get<Report>(`/reports/${encodeURIComponent(id)}`)
    return resp.data
  } catch (err) {
    logError("fetchReportById", err)
    return null
  }
}

/** PUT /reports/:id/resolve */
export async function resolveReport(id: string): Promise<Report | null> {
  if (!id.trim()) return null
  try {
    const resp = await http.put<Report>(
      `/reports/${encodeURIComponent(id)}/resolve`,
    )
    return resp.data
  } catch (err) {
    logError("resolveReport", err)
    return null
  }
}

/** DELETE /reports/:id */
export async function deleteReport(id: string): Promise<boolean> {
  if (!id.trim()) return false
  try {
    await http.delete(`/reports/${encodeURIComponent(id)}`)
    return true
  } catch (err) {
    logError("deleteReport", err)
    return false
  }
}

export default {
  submitReport,
  fetchReports,
  fetchReportById,
  resolveReport,
  deleteReport,
}
