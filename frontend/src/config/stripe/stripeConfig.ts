// src/config/stripe/stripeConfig.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '';

if (!PUBLIC_KEY) {
  console.warn(
    '[stripeConfig] NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set—Stripe will not initialize.',
  );
}

// A promise that resolves to a Stripe instance (or null if the key is missing)
const stripePromise: Promise<Stripe | null> = (async () => {
  if (!PUBLIC_KEY) return null;
  try {
    return await loadStripe(PUBLIC_KEY);
  } catch (err) {
    console.error('[stripeConfig] loadStripe() failed:', err);
    return null;
  }
})();

/**
 * Opens Stripe Checkout with the given session ID.
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await stripePromise;
  if (!stripe) {
    console.error('[stripeConfig] cannot redirect—stripe not loaded');
    return;
  }
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    console.error('[stripeConfig] redirectToCheckout error:', error);
  }
}

/**
 * Calls your backend to create a Checkout Session.
 * Expects an API route at /api/create-checkout-session.
 */
export async function createCheckoutSession(amountInCents: number): Promise<string> {
  const resp = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountInCents }),
  });
  if (!resp.ok) {
    throw new Error(
      `[stripeConfig] create-checkout-session failed: ${resp.status} ${resp.statusText}`,
    );
  }
  const data: { id: string } = await resp.json();
  return data.id;
}

export default stripePromise;
