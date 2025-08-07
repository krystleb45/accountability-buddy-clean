// src/milestones/milestoneApi.ts

import axios from "axios"

import { http } from "@/lib/http"

export interface Milestone {
  _id: string
  user: string
  title: string
  description?: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

/**
 * Fetch all milestones.
 * GET /milestones
 */
export async function fetchMilestones(): Promise<Milestone[]> {
  try {
    const resp = await http.get<Milestone[]>("/milestones")
    return resp.data
  } catch (err) {
    console.error(
      "❌ [milestoneApi::fetchMilestones]",
      axios.isAxiosError(err) ? err.response?.data || err.message : err,
    )
    return []
  }
}

/**
 * Add a new milestone.
 * POST /milestones/add
 */
export async function addMilestone(
  title: string,
  dueDate: string,
  description?: string,
): Promise<Milestone | null> {
  try {
    const resp = await http.post<Milestone>("/milestones/add", {
      title,
      description,
      dueDate,
    })
    return resp.data
  } catch (err) {
    console.error(
      "❌ [milestoneApi::addMilestone]",
      axios.isAxiosError(err) ? err.response?.data || err.message : err,
    )
    return null
  }
}

/**
 * Update an existing milestone.
 * PUT /milestones/update
 */
export async function updateMilestone(
  milestoneId: string,
  updates: Partial<{ title: string; description?: string; dueDate: string }>,
): Promise<Milestone | null> {
  try {
    const resp = await http.put<Milestone>("/milestones/update", {
      milestoneId,
      updates,
    })
    return resp.data
  } catch (err) {
    console.error(
      "❌ [milestoneApi::updateMilestone]",
      axios.isAxiosError(err) ? err.response?.data || err.message : err,
    )
    return null
  }
}

/**
 * Delete a milestone.
 * DELETE /milestones/delete
 */
export async function deleteMilestone(milestoneId: string): Promise<boolean> {
  try {
    const resp = await http.delete<{ success: boolean }>("/milestones/delete", {
      data: { milestoneId },
    })
    return resp.data.success
  } catch (err) {
    console.error(
      "❌ [milestoneApi::deleteMilestone]",
      axios.isAxiosError(err) ? err.response?.data || err.message : err,
    )
    return false
  }
}

export default {
  fetchMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
}
