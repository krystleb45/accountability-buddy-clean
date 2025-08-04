// src/trackers/trackerApi.ts

import axios from "axios"

import { http } from "@/utils/http"

// ---------------------
// Type Definitions
// ---------------------

/** A single tracker */
export interface Tracker {
  _id: string
  user: string
  name: string
  progress: number
  createdAt: string
  updatedAt: string
}

/** A piece of tracking data */
export interface TrackingData {
  _id: string
  user: string
  [key: string]: unknown
}

/** Error shape returned by the API */
interface ApiErrorResponse {
  message: string
}

// ---------------------
// Helpers
// ---------------------

function isAxiosError(
  error: unknown,
): error is { response?: { data: ApiErrorResponse } } {
  return axios.isAxiosError(error) && Boolean(error.response?.data)
}

function handleError(error: unknown): never {
  if (isAxiosError(error) && error.response?.data.message) {
    throw new Error(error.response.data.message)
  }
  throw new Error("An unknown error occurred.")
}

// ---------------------
// API Methods
// ---------------------

/** Fetch all trackers */
export async function fetchTrackers(): Promise<Tracker[]> {
  try {
    const resp = await http.get<Tracker[]>("/trackers")
    return resp.data
  } catch (error) {
    handleError(error)
  }
}

/** Create a new tracker */
export async function createTracker(name: string): Promise<Tracker> {
  if (!name.trim()) throw new Error("Tracker name is required")
  try {
    const resp = await http.post<Tracker>("/trackers", { name })
    return resp.data
  } catch (error) {
    handleError(error)
  }
}

/** Update an existing tracker */
export async function updateTracker(
  id: string,
  progress: number,
): Promise<Tracker> {
  if (!id.trim()) throw new Error("Tracker ID is required")
  try {
    const resp = await http.put<Tracker>(
      `/trackers/${encodeURIComponent(id)}`,
      { progress },
    )
    return resp.data
  } catch (error) {
    handleError(error)
  }
}

/** Delete a tracker */
export async function deleteTracker(id: string): Promise<{ message: string }> {
  if (!id.trim()) throw new Error("Tracker ID is required")
  try {
    const resp = await http.delete<{ message: string }>(
      `/trackers/${encodeURIComponent(id)}`,
    )
    return resp.data
  } catch (error) {
    handleError(error)
  }
}

/** Fetch all tracking data */
export async function fetchTrackingData(): Promise<TrackingData[]> {
  try {
    const resp = await http.get<TrackingData[]>("/trackers/data")
    return resp.data
  } catch (error) {
    handleError(error)
  }
}

/** Add a new piece of tracking data */
export async function addTrackingData(
  payload: Record<string, unknown>,
): Promise<TrackingData> {
  try {
    const resp = await http.post<TrackingData>("/trackers/add", payload)
    return resp.data
  } catch (error) {
    handleError(error)
  }
}

/** Delete a piece of tracking data */
export async function deleteTrackingData(
  id: string,
): Promise<{ message: string }> {
  if (!id.trim()) throw new Error("Tracking data ID is required")
  try {
    const resp = await http.delete<{ message: string }>(
      `/trackers/delete/${encodeURIComponent(id)}`,
    )
    return resp.data
  } catch (error) {
    handleError(error)
  }
}

export default {
  fetchTrackers,
  createTracker,
  updateTracker,
  deleteTracker,
  fetchTrackingData,
  addTrackingData,
  deleteTrackingData,
}
