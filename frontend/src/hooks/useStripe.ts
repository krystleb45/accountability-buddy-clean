// src/hooks/useStripe.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAPI } from '@/context/data/APIContext';
import type {
  SubscriptionDetails,
  BillingHistoryItem,
  UpdateSubscriptionPayload,
} from '../types/Stripe.types';

interface UseStripeReturn {
  subscription: SubscriptionDetails | null;
  billingHistory: BillingHistoryItem[];
  loading: boolean;
  error: string | null;
  fetchSubscriptionDetails: () => Promise<void>;
  fetchBillingHistory: () => Promise<void>;
  updateSubscription: (payload: UpdateSubscriptionPayload) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

export default function useStripe(): UseStripeReturn {
  const { callAPI } = useAPI();

  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keep stable refs so you can call them together later
  const fetchSubRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const fetchHistRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const fetchSubscriptionDetails = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await callAPI<SubscriptionDetails>({
        method: 'get',
        url: '/stripe/subscription-details',
      });
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription details:', err);
      setError('Could not load subscription details.');
    } finally {
      setLoading(false);
    }
  }, [callAPI]);

  const fetchBillingHistory = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const resp = await callAPI<{ billingHistory: BillingHistoryItem[] }>({
        method: 'get',
        url: '/stripe/billing-history',
      });
      setBillingHistory(resp.billingHistory);
    } catch (err) {
      console.error('Error fetching billing history:', err);
      setError('Could not load billing history.');
    } finally {
      setLoading(false);
    }
  }, [callAPI]);

  const updateSubscription = useCallback(
    async (payload: UpdateSubscriptionPayload): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await callAPI<void>({
          method: 'post',
          url: '/stripe/update-subscription',
          data: payload,
        });
        // refresh details after change
        await fetchSubscriptionDetails();
      } catch (err) {
        console.error('Error updating subscription:', err);
        setError('Failed to update your subscription.');
      } finally {
        setLoading(false);
      }
    },
    [callAPI, fetchSubscriptionDetails],
  );

  const cancelSubscription = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await callAPI<void>({ method: 'post', url: '/stripe/cancel-subscription' });
      setSubscription(null);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription.');
    } finally {
      setLoading(false);
    }
  }, [callAPI]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // wire refs for a combined refresh
  fetchSubRef.current = fetchSubscriptionDetails;
  fetchHistRef.current = fetchBillingHistory;

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSubRef.current!(), fetchHistRef.current!()]);
  }, []);

  // initial load
  useEffect(() => {
    refreshAll().catch(console.error);
  }, [refreshAll]);

  return {
    subscription,
    billingHistory,
    loading,
    error,
    fetchSubscriptionDetails,
    fetchBillingHistory,
    updateSubscription,
    cancelSubscription,
    clearError,
    refreshAll,
  };
}
