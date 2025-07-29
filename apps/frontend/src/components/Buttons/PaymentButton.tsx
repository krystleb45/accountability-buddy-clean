// src/components/Buttons/PaymentButton.tsx
'use client';

import React, { useState } from 'react';
import SubscriptionService from '@/services/subscriptionService';
import styles from './PaymentButton.module.css';

interface PaymentButtonProps {
  buttonText: string;
  priceId: string; // which Stripe price to use
  onSuccess?: () => void; // Optional callback for success
  onError?: (error: string) => void; // Optional callback for error
}

const stripeCheckoutBase =
  process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL ?? 'https://checkout.stripe.com';

const PaymentButton: React.FC<PaymentButtonProps> = ({
  buttonText,
  priceId,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // You need to supply your site’s success/cancel URLs
      const successUrl = `${window.location.origin}/payment-success`;
      const cancelUrl = `${window.location.origin}/payment-cancel`;

      const { sessionId, url } = await SubscriptionService.createPaidSession(
        priceId,
        successUrl,
        cancelUrl,
      );

      onSuccess?.();

      // If your service returns a full redirect URL use `url`,
      // otherwise fall back to building one from sessionId:
      const redirectTo = url
        ? url
        : `${stripeCheckoutBase}/session/${encodeURIComponent(sessionId)}`;

      window.location.href = redirectTo;
    } catch (err) {
      console.error('Error creating subscription session:', err);
      const msg = 'Failed to start payment. Please try again.';
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentButtonContainer}>
      <button
        type="button"
        className={`${styles.paymentButton} ${loading ? styles.loading : ''}`}
        onClick={handlePayment}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Processing…' : buttonText}
      </button>
      {error && (
        <p role="alert" className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PaymentButton;
