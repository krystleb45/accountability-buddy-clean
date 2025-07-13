// src/types/Stripe.types.ts

/**
 * A single record in the user’s billing history
 */
export interface BillingHistoryItem {
  id: string;
  date: string;            // ISO date string of the transaction
  description: string;     // e.g. “Monthly Plan Payment”
  amount: number;          // Amount in cents
  status: 'paid' | 'pending' | 'failed';
}

/**
 * Details of a user’s current subscription
 */
export interface SubscriptionDetails {
  id: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  nextBillingDate: string; // ISO date string
  createdAt: string;       // ISO date string
  canceledAt?: string;     // ISO date string, if they’ve canceled
}

/**
 * Payload for creating a new Stripe subscription.
 */
export interface CreateSubscriptionPayload {
  /** The ID of the price to subscribe the customer to */
  priceId: string;
  // …any other fields you need (e.g. quantity, metadata)…
}

/**
 * Payload for updating an existing Stripe subscription.
 */
export interface UpdateSubscriptionPayload {
  /** The ID of the subscription you want to update */
  subscriptionId: string;

  /**
   * The new line items array:
   * e.g. [{ price: 'price_xyz', quantity: 1 }]
   */
  items: Array<{
    price: string;
    quantity?: number;
  }>;
}
