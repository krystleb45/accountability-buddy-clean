/**
 * TypeScript type definitions for Stripe.
 * These definitions ensure consistent typing for Stripe integration
 * across both the frontend and backend.
 */

import Stripe from 'stripe';

/**
 * Represents the structure of a Stripe customer.
 */
export interface StripeCustomer {
  id: string; // The Stripe customer ID (e.g., cus_123456789)
  email: string; // Customer email address
  metadata?: Record<string, string>; // Metadata for custom fields
  subscriptionId?: string; // Associated subscription ID
}

/**
 * Represents the structure of a Stripe subscription.
 */
export interface StripeSubscription {
  id: string; // The Stripe subscription ID (e.g., sub_123456789)
  customerId: string; // The Stripe customer ID associated with the subscription
  status: Stripe.Subscription.Status; // Status of the subscription (e.g., active, past_due)
  currentPeriodStart: number; // Unix timestamp for the start of the current billing period
  currentPeriodEnd: number; // Unix timestamp for the end of the current billing period
  items: Stripe.SubscriptionItem[]; // Items associated with the subscription
  cancelAtPeriodEnd: boolean; // Whether the subscription is set to cancel at the end of the current period
}

/**
 * Represents a Stripe payment intent for processing payments.
 */
export interface StripePaymentIntent {
  id: string; // The Stripe payment intent ID (e.g., pi_123456789)
  amount: number; // The amount to be charged in the smallest currency unit (e.g., cents)
  currency: string; // The currency code (e.g., USD, EUR)
  status: Stripe.PaymentIntent.Status; // Status of the payment intent (e.g., succeeded, requires_action)
  clientSecret: string; // The client secret used to confirm the payment intent on the frontend
  metadata?: Record<string, string>; // Metadata for custom fields
}

/**
 * Represents a Stripe invoice.
 */
export interface StripeInvoice {
  id: string; // The Stripe invoice ID (e.g., inv_123456789)
  customerId: string; // The Stripe customer ID associated with the invoice
  subscriptionId?: string; // The associated subscription ID (if applicable)
  amountDue: number; // The total amount due on the invoice
  status: Stripe.Invoice.Status; // Status of the invoice (e.g., paid, open, void)
  hostedInvoiceUrl?: string; // URL to the hosted invoice page
}

/**
 * Represents metadata for custom Stripe fields.
 * This can be used to store additional information for customers, payments, etc.
 */
export type StripeMetadata = Record<string, string>;

/**
 * Represents a Stripe webhook event.
 */
export interface StripeWebhookEvent {
  id: string; // The ID of the webhook event (e.g., evt_123456789)
  type: string; // The type of event (e.g., customer.created, invoice.payment_succeeded)
  data: {
    object: Stripe.Customer | Stripe.Subscription | Stripe.Invoice | Stripe.PaymentIntent; // The actual object related to the event
  };
  created: number; // Unix timestamp when the event was created
}

/**
 * Enum for Stripe subscription statuses.
 * This helps ensure consistent usage of subscription statuses in your application.
 */
export enum StripeSubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ALL = 'all', // For fetching all subscriptions
}

/**
 * Utility types for frontend and backend.
 */
export type CreateStripeCustomerInput = {
  email: string; // Customer's email address
  metadata?: StripeMetadata; // Optional metadata
};

export type CreateStripeSubscriptionInput = {
  customerId: string; // The Stripe customer ID
  priceId: string; // The ID of the price for the subscription
  metadata?: StripeMetadata; // Optional metadata
  trialEnd?: number; // Unix timestamp for when the trial ends (optional)
};

export type StripeWebhookHandler = (event: StripeWebhookEvent) => Promise<void>; // A handler type for Stripe webhooks

/**
 * Export the main Stripe instance type for use across the application.
 */
export type StripeInstance = Stripe;
