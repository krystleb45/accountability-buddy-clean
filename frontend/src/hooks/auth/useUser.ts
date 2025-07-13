// src/hooks/auth/useUser.ts
import { useCallback } from 'react';
import {
  useUserSubscription,
  Subscription,
  SubscriptionApiResponse,
} from '@/context/data/UserSubscriptionContext';
import type { SubscriptionPlan } from '@/types/Subscription.types';
import type { User } from '@/types/User.types';

export interface UseUserReturn {
  user: User | null;
  subscription: Subscription | null;
  subscriptionPlan: SubscriptionPlan | null;
  isAuthenticated: boolean;
  /** Returns the raw API payload (or null on failure) */
  fetchSubscription: () => Promise<SubscriptionApiResponse | null>;
  login: () => Promise<void>;
  logout: () => void;
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
}

export default function useUser(): UseUserReturn {
  const { user, subscription, isSubscriptionActive, fetchSubscription, updateUser } =
    useUserSubscription();

  // Just cast the incoming string to the SubscriptionPlan type (you might still
  // want to validate it against a known list)
  const subscriptionPlan: SubscriptionPlan | null = subscription
    ? (subscription.plan as unknown as SubscriptionPlan)
    : null;

  const login = useCallback(async (): Promise<void> => {
    // e.g. hit your login endpoint, then refresh subscription
    await fetchSubscription();
  }, [fetchSubscription]);

  const logout = useCallback((): void => {
    // clear user (and subscription if you extend it)
    updateUser(null as unknown as User);
  }, [updateUser]);

  const updateSubscriptionPlan = useCallback(
    async (_plan: SubscriptionPlan): Promise<void> => {
      // call your subscription-update API here...
      await fetchSubscription();
    },
    [fetchSubscription],
  );

  return {
    user,
    subscription,
    subscriptionPlan,
    isAuthenticated: isSubscriptionActive,
    fetchSubscription,
    login,
    logout,
    updateSubscription: updateSubscriptionPlan,
  };
}
