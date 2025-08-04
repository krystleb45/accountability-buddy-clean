// src/dashboard/dashboardApi.ts

import { http } from "@/utils/http"

export interface DashboardStats {
  totalGoals: number
  completedGoals: number
  collaborations: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // hit our Next.js proxy under /dashboard/stats
  const resp = await http.get<{ success: boolean; data: DashboardStats }>(
    "/dashboard/stats",
  )
  return resp.data.data
}
