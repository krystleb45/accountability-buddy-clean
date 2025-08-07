// src/services/subscriptionService.ts
import { getAuthHeader } from "@/services/authService"
import { http } from "@/lib/http"

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
}

export interface CurrentSubscription {
  subscription: {
    _id: string
    status: string
    plan: string
    isActive: boolean
    [key: string]: unknown
  } | null
}

export interface TrialResponse {
  trial: {
    subscriptionId: string
    trialEndsAt: string
  }
}

export interface CheckoutSession {
  sessionId: string
  url?: string
}

export interface RealTimeStatus {
  subscription: unknown | null
  status: string
}

const SubscriptionService = {
  /** GET /users/:userId/subscription */
  async getMyStatus(userId: string): Promise<SubscriptionStatus> {
    const resp = await http.get<{ success: boolean; data: SubscriptionStatus }>(
      `/users/${encodeURIComponent(userId)}/subscription`,
      { headers: getAuthHeader() },
    )
    if (!resp.data.success) {
      throw new Error("Failed to fetch subscription status")
    }
    return resp.data.data!
  },

  /** GET /subscription/current */
  async getCurrent(): Promise<CurrentSubscription> {
    const resp = await http.get<{
      success: boolean
      data: CurrentSubscription
    }>("/subscription/current", { headers: getAuthHeader() })
    if (!resp.data.success) {
      throw new Error("Failed to fetch current subscription")
    }
    return resp.data.data!
  },

  /** POST /subscription/start-trial */
  async startTrial(): Promise<TrialResponse> {
    const resp = await http.post<{ success: boolean; data: TrialResponse }>(
      "/subscription/start-trial",
      null,
      { headers: getAuthHeader() },
    )
    if (!resp.data.success) {
      throw new Error("Failed to start trial")
    }
    return resp.data.data!
  },

  /** POST /subscription/create */
  async createPaidSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSession> {
    const resp = await http.post<{ success: boolean; data: CheckoutSession }>(
      "/subscription/create",
      { priceId, successUrl, cancelUrl },
      { headers: getAuthHeader() },
    )
    if (!resp.data.success) {
      throw new Error("Failed to create checkout session")
    }
    return resp.data.data!
  },

  /** DELETE /subscription/cancel */
  async cancelSubscription(refund = false): Promise<void> {
    const resp = await http.delete<{ success: boolean; message?: string }>(
      "/subscription/cancel",
      {
        headers: getAuthHeader(),
        data: { refund },
      },
    )
    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to cancel subscription")
    }
  },

  /** POST /subscription/upgrade */
  async upgrade(priceId: string): Promise<void> {
    const resp = await http.post<{ success: boolean; message?: string }>(
      "/subscription/upgrade",
      { newPriceId: priceId },
      { headers: getAuthHeader() },
    )
    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to upgrade subscription")
    }
  },

  /** GET /subscription/status */
  async getRealTimeStatus(): Promise<RealTimeStatus> {
    const resp = await http.get<{ success: boolean; data: RealTimeStatus }>(
      "/subscription/status",
      { headers: getAuthHeader() },
    )
    if (!resp.data.success) {
      throw new Error("Failed to fetch real-time status")
    }
    return resp.data.data!
  },

  /** POST /subscription/expire-trial */
  async expireTrial(): Promise<void> {
    const resp = await http.post<{ success: boolean; message?: string }>(
      "/subscription/expire-trial",
      null,
      { headers: getAuthHeader() },
    )
    if (!resp.data.success) {
      throw new Error("Failed to expire trial")
    }
  },
}

export default SubscriptionService
