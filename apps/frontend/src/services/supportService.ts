// src/api/support/supportService.ts
import type { AxiosResponse } from "axios"

import axios from "axios"

import { getAuthHeader } from "@/services/authService"
import { http } from "@/utils/http"

// ---------------------
// Type Definitions
// ---------------------

export interface SupportData {
  name: string
  email: string
  subject: string
  message: string
  priority?: string
  [key: string]: unknown
}

export interface SupportTicket {
  id: string
  status: string
  createdAt: string
  updatedAt?: string
  priority?: string
  [key: string]: unknown
}

export interface TicketDetails extends SupportTicket {
  messages: Array<{ sender: string; content: string; timestamp: string }>
}

interface ApiErrorResponse {
  message: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

// ---------------------
// Retry helper for HTTP requests
// ---------------------

async function retry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isServerError =
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500
      if (isServerError && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
        attempt++
        continue
      }
      // non‑recoverable or out of retries
      if (
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.data?.message
      ) {
        throw new Error(err.response.data.message)
      }
      throw err
    }
  }
  throw new Error("Failed after multiple retries.")
}

// ---------------------
// Service Methods
// ---------------------

/**
 * Send a support request.
 */
export async function contactSupport(supportData: SupportData): Promise<void> {
  const { name, email, subject, message } = supportData
  if (!name || !email || !subject || !message) {
    throw new Error(
      "All required fields (name, email, subject, message) must be provided.",
    )
  }
  await retry(() =>
    http.post<ApiResponse<null>>("/support/contact", supportData, {
      headers: getAuthHeader(),
    }),
  )
}

/**
 * Retrieve all support tickets.
 */
export async function getSupportTickets(): Promise<SupportTicket[]> {
  const resp = await retry(() =>
    http.get<ApiResponse<SupportTicket[]>>("/support/tickets", {
      headers: getAuthHeader(),
    }),
  )
  if (!resp.data.success || !resp.data.data) {
    throw new Error(resp.data.message ?? "Failed to fetch support tickets.")
  }
  return resp.data.data
}

/**
 * Fetch details for a single ticket.
 */
export async function getTicketDetails(
  ticketId: string,
): Promise<TicketDetails> {
  if (!ticketId) {
    throw new Error("Ticket ID is required to fetch ticket details.")
  }
  const resp = await retry(() =>
    http.get<ApiResponse<TicketDetails>>(
      `/support/tickets/${encodeURIComponent(ticketId)}`,
      {
        headers: getAuthHeader(),
      },
    ),
  )
  if (!resp.data.success || !resp.data.data) {
    throw new Error(resp.data.message ?? "Failed to fetch ticket details.")
  }
  return resp.data.data
}

/**
 * Update a support ticket.
 */
export async function updateSupportTicket(
  ticketId: string,
  updateData: Partial<SupportTicket>,
): Promise<void> {
  if (!ticketId) {
    throw new Error("Ticket ID is required to update a support ticket.")
  }
  await retry(() =>
    http.put<ApiResponse<null>>(
      `/support/tickets/${encodeURIComponent(ticketId)}`,
      updateData,
      {
        headers: getAuthHeader(),
      },
    ),
  )
}

const SupportService = {
  contactSupport,
  getSupportTickets,
  getTicketDetails,
  updateSupportTicket,
}

export default SupportService
