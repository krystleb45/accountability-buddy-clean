// src/payments/paymentApi.ts

import axios from "axios"

import { http } from "@/lib/http"

export interface CheckoutSessionResponse {
  id: string
  url: string
}

export interface PaymentStatus {
  status: string
  details?: Record<string, unknown>
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [paymentApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [paymentApi::${fn}]`, error)
  }
}

/**
 * Create a checkout session.
 * @returns session info or null on failure.
 */
export async function createCheckoutSession(
  amount: number,
): Promise<CheckoutSessionResponse | null> {
  if (amount <= 0) {
    console.error("[paymentApi] createCheckoutSession: invalid amount")
    return null
  }
  try {
    const resp = await http.post<CheckoutSessionResponse>(
      "/payments/create-checkout-session",
      {
        amount,
      },
    )
    return resp.data
  } catch (err: unknown) {
    logError("createCheckoutSession", err)
    return null
  }
}

/**
 * Fetch payment status by session ID.
 * @returns status or null on failure.
 */
export async function fetchPaymentStatus(
  sessionId: string,
): Promise<PaymentStatus | null> {
  if (!sessionId.trim()) {
    console.error("[paymentApi] fetchPaymentStatus: sessionId is required")
    return null
  }
  try {
    const resp = await http.get<PaymentStatus>(
      `/payments/status/${encodeURIComponent(sessionId)}`,
    )
    return resp.data
  } catch (err: unknown) {
    logError("fetchPaymentStatus", err)
    return null
  }
}

export default {
  createCheckoutSession,
  fetchPaymentStatus,
}
