// src/support/supportApi.ts

import axios from "axios" // for axios.isAxiosError type-guard

import { http } from "@/utils/http"

// ---------------------
// Type Definitions
// ---------------------

/** Data submitted when contacting support */
export interface SupportData {
  name: string
  email: string
  subject: string
  message: string
}

/** A support ticket and its conversation */
export interface SupportTicket {
  id: string
  subject: string
  status: string
  messages: Array<{ sender: string; content: string; timestamp: string }>
  createdAt: string
  updatedAt: string
}

/** API error response structure */
interface ApiErrorResponse {
  message: string
}

// ---------------------
// Helpers
// ---------------------

/** Type guard for Axios errors */
function isAxiosError(
  error: unknown,
): error is { response?: { data: ApiErrorResponse } } {
  return axios.isAxiosError(error) && Boolean(error.response?.data)
}

/** Centralized error handler that always throws */
function handleError(error: unknown): never {
  if (isAxiosError(error) && error.response?.data?.message) {
    throw new Error(error.response.data.message)
  }
  throw new Error("An unknown error occurred.")
}

// ---------------------
// Support API Methods
// ---------------------

/**
 * Send a message to support
 */
export async function contactSupport(
  supportData: SupportData,
): Promise<{ message: string }> {
  try {
    const response = await http.post<{ message: string }>(
      "/support/contact",
      supportData,
    )
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Retrieve all tickets submitted by the user
 */
export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    const response = await http.get<SupportTicket[]>("/support/tickets")
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get details for a specific ticket
 */
export async function getSupportTicketDetails(
  ticketId: string,
): Promise<SupportTicket> {
  if (!ticketId.trim()) {
    throw new Error("Ticket ID is required")
  }
  try {
    const response = await http.get<SupportTicket>(
      `/support/tickets/${encodeURIComponent(ticketId)}`,
    )
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Reply to an existing support ticket
 */
export async function replyToSupportTicket(
  ticketId: string,
  message: string,
): Promise<SupportTicket> {
  if (!ticketId.trim() || !message.trim()) {
    throw new Error("Both ticketId and message are required")
  }
  try {
    const response = await http.post<SupportTicket>(
      `/support/tickets/${encodeURIComponent(ticketId)}/reply`,
      { message },
    )
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export default {
  contactSupport,
  getSupportTickets,
  getSupportTicketDetails,
  replyToSupportTicket,
}
