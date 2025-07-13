// src/components/Stripe/StripeCheckout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
  CardElementProps,
} from '@stripe/react-stripe-js';
import styles from './StripeCheckout.module.css';

// Make sure you expose your key as NEXT_PUBLIC_STRIPE_PUBLIC_KEY
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? 'pk_test_XXXXXXXXXXXXXXXXXXXX',
);

interface StripeCheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  clientSecret,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Clear any previous card errors when clientSecret changes
  useEffect(() => {
    setCardError(null);
  }, [clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setCardError(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setCardError('Payment details are missing.');
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      onError(error.message ?? 'Payment failed.');
      setCardError(error.message ?? 'Payment failed.');
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      const msg = 'Payment did not succeed. Please try again.';
      onError(msg);
      setCardError(msg);
    }

    setLoading(false);
  };

  const cardOptions: CardElementProps['options'] = {
    style: {
      base: {
        'fontSize': '16px',
        'color': '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#9e2146' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Card Details</legend>
        <CardElement options={cardOptions} />
      </fieldset>

      {cardError && (
        <p role="alert" aria-live="assertive" className={styles.error}>
          {cardError}
        </p>
      )}

      <button
        type="submit"
        className={styles.button}
        disabled={!stripe || loading}
        aria-busy={loading}
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
};

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ clientSecret, onSuccess, onError }) => {
  if (!clientSecret) {
    return (
      <p role="alert" className={styles.error}>
        Unable to process payment: missing client secret.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
};

export default StripeCheckout;
