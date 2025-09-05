import axios, { isAxiosError } from "axios"

import { API_ENDPOINTS, getApiUrl } from "@/config/api/apiConfig"

import { http } from "../lib/http"

/** Logs the raw error and re-throws a user-friendly one */
function handleApiError(error: unknown): never {
  if (isAxiosError(error)) {
    console.error(
      `API Error [${error.response?.status}]`,
      error.response?.data ?? error.message,
    )
  } else {
    console.error("Unexpected API error", (error as Error).message)
  }
  throw new Error("API request failed. Please try again later.")
}

/**
 * Generic GET
 */
export async function fetchData<T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const url = getApiUrl(endpoint)
    const { data } = await http.get<T>(url, { params })
    return data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Generic POST
 */
export async function postData<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    const url = getApiUrl(endpoint)
    const { data } = await http.post<T>(url, body)
    return data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Generic PUT
 */
export async function updateData<T>(
  endpoint: string,
  body: unknown,
): Promise<T> {
  try {
    const url = getApiUrl(endpoint)
    const { data } = await http.put<T>(url, body)
    return data
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Generic DELETE
 */
export async function deleteData(endpoint: string): Promise<void> {
  try {
    const url = getApiUrl(endpoint)
    await http.delete(url)
  } catch (err) {
    handleApiError(err)
  }
}

/**
 * Cancel the user’s subscription.
 */
export async function cancelSubscription(): Promise<void> {
  await postData<void>(API_ENDPOINTS.SUBSCRIPTION.CANCEL, {})
}

/**
 * Helpers for display formatting.
 */
export function formatSubscriptionStatus(status: string): string {
  return (
    {
      active: "Active",
      canceled: "Canceled",
      past_due: "Past Due",
      trialing: "Trialing",
    }[status] ?? "Unknown"
  )
}

export function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getApiErrorMessage(err: Error): string {
  return axios.isAxiosError(err) && err.response
    ? err.response.data.message
    : err.message
}
