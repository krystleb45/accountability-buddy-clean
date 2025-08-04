// src/components/Stripe/Stripe.types.ts

/**
 * Details about a user’s subscription.
 */
export interface SubscriptionDetails {
  id: string // Unique identifier for the subscription
  planName: string // Name of the plan (e.g. "Pro Plan")
  status: "active" | "canceled" | "past_due" | "incomplete" | "trialing"
  nextBillingDate?: string // ISO date of the next payment, if any
  createdAt: string // ISO date when subscription was created
  canceledAt?: string // ISO date when canceled (if applicable)
}

/**
 * Single entry in the billing history.
 */
export interface BillingHistoryItem {
  id: string // Unique record ID
  date: string // ISO date of transaction
  description: string // E.g. "Monthly Plan Payment"
  amount: number // In cents (e.g. 1099 for $10.99)
  status: "paid" | "pending" | "failed"
}

/**
 * Payload returned when you fetch subscription details.
 */
export interface SubscriptionDetailsResponse {
  subscription: SubscriptionDetails | null
}

/**
 * Payload returned when you fetch billing history.
 */
export interface BillingHistoryResponse {
  billingHistory: BillingHistoryItem[]
}

/**
 * What you send to switch plans.
 */
export interface UpdateSubscriptionPayload {
  planId: string
}

/**
 * Options when cancelling — here only `refund` if you want one.
 */
export interface CancelSubscriptionOptions {
  refund?: boolean
}

/**
 * The real‐time status endpoint returns both the subscription
 * and a loose `status` string.
 */
export interface RealTimeStatus {
  subscription: SubscriptionDetails | null
  status: string
}

/**
 * Trial‐related responses.
 */
export interface TrialResponse {
  trial: {
    subscriptionId: string
    trialEndsAt: string
  }
}

/**
 * Checkout session info for Stripe.
 */
export interface CheckoutSession {
  sessionId: string
  url?: string
}
