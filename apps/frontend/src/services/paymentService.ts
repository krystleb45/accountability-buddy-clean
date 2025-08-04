// src/services/paymentService.ts
import { http } from "@/utils/http"

export interface CheckoutSessionResponse {
  id: string
  url: string
}

export interface PaymentStatus {
  status: string
  details?: Record<string, unknown>
}

const PaymentService = {
  /**
   * Creates a checkout session for the given amount (in cents).
   * POST /payments/create-checkout-session
   */
  async createCheckoutSession(
    amount: number,
  ): Promise<CheckoutSessionResponse> {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0.")
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
      console.error("[PaymentService.createCheckoutSession]", err)
      throw new Error("Failed to create checkout session.")
    }
  },

  /**
   * Retrieves payment status by session ID.
   * GET /payments/status/:sessionId
   */
  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    if (!sessionId.trim()) {
      throw new Error("Session ID is required.")
    }
    try {
      const resp = await http.get<PaymentStatus>(
        `/payments/status/${encodeURIComponent(sessionId)}`,
      )
      return resp.data
    } catch (err: unknown) {
      console.error("[PaymentService.getPaymentStatus]", err)
      throw new Error("Failed to retrieve payment status.")
    }
  },
}

export default PaymentService
