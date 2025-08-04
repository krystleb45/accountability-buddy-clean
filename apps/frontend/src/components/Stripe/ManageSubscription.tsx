"use client"

import React, { useEffect, useState } from "react"

import {
  cancelSubscription,
  fetchSubscriptionDetails,
  updateSubscription,
} from "@/utils/apiUtils"

import type { SubscriptionDetails } from "../../types/Stripe.types"

import styles from "./Stripe.module.css"

const ManageSubscription: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null,
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<boolean>(false)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        setLoading(true)
        const details = await fetchSubscriptionDetails()
        setSubscription(details)
        setError(null)
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load subscription details.",
        )
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleUpdate = async (planId: string): Promise<void> => {
    if (!subscription) return // guard against null

    try {
      setUpdating(true)
      await updateSubscription({
        subscriptionId: subscription.id,
        items: [{ price: planId }],
      })
      const refreshed = await fetchSubscriptionDetails()
      setSubscription(refreshed)
      setError(null)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update subscription.",
      )
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async (): Promise<void> => {
    try {
      setUpdating(true)
      await cancelSubscription()
      setSubscription(null)
      setError(null)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel subscription.",
      )
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <p className={styles.loading} role="status" aria-live="polite">
        Loading subscription details…
      </p>
    )
  }

  if (error) {
    return (
      <p className={styles.error} role="alert" aria-live="assertive">
        {error}
      </p>
    )
  }

  return (
    <section
      className={styles.subscriptionContainer}
      aria-labelledby="manage-sub-heading"
    >
      <h2 id="manage-sub-heading" className={styles.heading}>
        Manage Your Subscription
      </h2>

      {!subscription ? (
        <p className={styles.noSubscription} role="status">
          You don’t have an active subscription.
        </p>
      ) : (
        <div className={styles.details}>
          <p>
            <strong>Plan:</strong> {subscription.planName}
          </p>
          <p>
            <strong>Status:</strong> {subscription.status}
          </p>
          <p>
            <strong>Next Billing Date:</strong>{" "}
            {subscription.nextBillingDate
              ? new Date(subscription.nextBillingDate).toLocaleDateString()
              : "N/A"}
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => handleUpdate("new-plan-id")}
              disabled={updating}
              className={styles.button}
              aria-label="Change subscription plan"
            >
              {updating ? "Updating…" : "Upgrade/Downgrade Plan"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={updating}
              className={`${styles.button} ${styles.cancelButton}`}
              aria-label="Cancel subscription"
            >
              {updating ? "Cancelling…" : "Cancel Subscription"}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ManageSubscription
