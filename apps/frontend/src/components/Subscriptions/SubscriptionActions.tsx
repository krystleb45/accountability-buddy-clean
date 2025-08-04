// src/components/Subscriptions/SubscriptionActions.tsx
"use client"

import React, { useState } from "react"

import type { UpdateSubscriptionPayload } from "@/types/Stripe.types"

import useStripe from "@/hooks/useStripe"

import styles from "./SubscriptionActions.module.css"

const SubscriptionActions: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { subscription, updateSubscription, cancelSubscription } = useStripe()

  const handleUpgrade = async (priceId: string) => {
    if (!subscription) return

    setLoading(true)
    setError(null)

    const payload: UpdateSubscriptionPayload = {
      subscriptionId: subscription.id,
      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    }

    try {
      await updateSubscription(payload)
      // The hook will refresh subscription data automatically
    } catch (err) {
      console.error("Upgrade error:", err)
      setError("Failed to upgrade subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return
    }
    setLoading(true)
    setError(null)

    try {
      await cancelSubscription()
      // subscription is now null in the hook
    } catch (err) {
      console.error("Cancel error:", err)
      setError("Failed to cancel subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className={styles.container}
      aria-labelledby="subscription-actions-heading"
    >
      <h2 id="subscription-actions-heading" className={styles.heading}>
        Manage Your Subscription
      </h2>

      {subscription ? (
        <>
          <div className={styles.details}>
            <p>
              <strong>Current Plan:</strong> {subscription.planName}
            </p>
            <p>
              <strong>Status:</strong> {subscription.status}
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.upgradeButton}
              onClick={() => handleUpgrade("price_new_plan_id")}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Upgrading…" : "Upgrade Plan"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Cancelling…" : "Cancel Subscription"}
            </button>
          </div>

          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </>
      ) : (
        <p className={styles.noSubscription}>
          You currently do not have an active subscription.
        </p>
      )}
    </section>
  )
}

export default SubscriptionActions
