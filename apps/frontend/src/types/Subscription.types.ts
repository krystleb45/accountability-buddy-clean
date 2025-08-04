/**
 * Represents a subscription plan.
 */
export interface SubscriptionPlan {
  /** Unique identifier for the subscription plan. */
  id: string

  /** Name of the subscription plan (e.g., "Basic", "Pro", "Premium"). */
  name: string

  /** Description of the subscription plan. */
  description: string

  /** Monthly cost of the subscription plan (in cents). */
  monthlyCost: number

  /** Annual cost of the subscription plan (in cents, optional). */
  annualCost?: number

  /** List of features included in the subscription plan. */
  features: string[]

  /** Indicates if the plan is currently active or deprecated. */
  isActive: boolean

  /** Indicates whether a free trial is available for this plan. */
  hasTrial?: boolean

  /** Number of trial days available (if applicable). */
  trialDays?: number

  /** Date when the plan was created (ISO format or Unix timestamp). */
  createdAt: string | number

  /** Date when the plan was last updated (ISO format or Unix timestamp, optional). */
  updatedAt?: string | number
}

/**
 * Represents the status of a user's subscription.
 */
export interface SubscriptionStatus {
  /** Status of the subscription. */
  status: "active" | "inactive" | "canceled" | "trial" | "expired"

  /** Unique identifier for the current subscription plan. */
  planId: string

  /** Name of the current subscription plan. */
  planName: string

  /** Start date of the subscription (ISO format or Unix timestamp). */
  startDate: string | number

  /** End date of the subscription (ISO format or Unix timestamp, optional for recurring). */
  endDate?: string | number

  /** Indicates if the subscription is currently in a trial period. */
  isTrial: boolean

  /** Number of days remaining in the trial period (optional). */
  trialDaysRemaining?: number

  /** Whether auto-renewal is enabled for this subscription. */
  autoRenew: boolean

  /** Date when the subscription was last updated (ISO format or Unix timestamp). */
  updatedAt?: string | number

  /** Next billing date (ISO format or Unix timestamp, optional). */
  nextBillingDate?: string | number
}

/**
 * Represents user preferences or metadata for subscriptions.
 */
export interface SubscriptionPreferences {
  /** Indicates if the user has opted for auto-renewal. */
  autoRenew: boolean

  /** Preferred payment method for the subscription. */
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "crypto"

  /** List of email notifications the user has opted into (optional). */
  emailNotifications?: string[]

  /** Metadata for storing additional preferences or data. */
  metadata?: Record<string, unknown>
}

/**
 * Represents a response from the subscription API.
 */
export interface SubscriptionResponse {
  /** Total number of subscription plans available. */
  totalPlans: number

  /** Array of available subscription plans. */
  plans: SubscriptionPlan[]

  /** Current subscription status of the user. */
  userSubscriptionStatus?: SubscriptionStatus
}

/**
 * Represents a request to update a subscription.
 */
export interface UpdateSubscriptionRequest {
  /** The new plan ID to switch to (if upgrading/downgrading). */
  newPlanId: string

  /** Whether to enable auto-renewal for the new plan. */
  autoRenew?: boolean

  /** The payment method to use for the new plan. */
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "crypto"
}

/**
 * Represents a subscription cancellation request.
 */
export interface CancelSubscriptionRequest {
  /** Indicates whether to cancel immediately or at the end of the billing cycle. */
  cancelImmediately: boolean

  /** Reason for cancellation (optional). */
  reason?: string
}

/**
 * Represents a billing history entry for a user.
 */
export interface BillingHistory {
  /** Unique transaction ID. */
  transactionId: string

  /** Date of the transaction (ISO format or Unix timestamp). */
  date: string | number

  /** Amount paid (in cents). */
  amount: number

  /** Currency used for the transaction. */
  currency: string

  /** Payment method used for this transaction. */
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "crypto"

  /** Status of the payment (e.g., "completed", "pending", "failed"). */
  status: "completed" | "pending" | "failed"

  /** Additional metadata related to the transaction (optional). */
  metadata?: Record<string, unknown>
}

/**
 * Represents a billing history response.
 */
export interface BillingHistoryResponse {
  /** Total number of transactions in the billing history. */
  totalTransactions: number

  /** Array of billing history entries. */
  transactions: BillingHistory[]

  /** Current page of billing history (for pagination). */
  currentPage: number

  /** Number of transactions per page. */
  transactionsPerPage: number
}
