import React, { useState } from "react"

import styles from "./SubscriptionSettings.module.css"

// stub types
interface BillingItem {
  date: string
  amount: string
}
const mockHistory: BillingItem[] = [
  { date: "2025-04-01", amount: "$14.99" },
  { date: "2025-03-01", amount: "$14.99" },
]

const SubscriptionSettings: React.FC = () => {
  // In real app, fetch this via hook
  const [plan] = useState<string>("Premium")
  const [renewalDate] = useState<string>("2025-06-01")
  const [history] = useState<BillingItem[]>(mockHistory)

  const cancelSubscription = () => {
    // alert('Subscription canceled');
    // TODO: call API
  }

  return (
    <div className={styles.container}>
      <h2>Subscription & Billing</h2>

      <div className={styles.currentPlan}>
        <p>
          <strong>Current Plan:</strong> {plan}
        </p>
        <p>
          <strong>Renewal Date:</strong> {renewalDate}
        </p>
        <button
          className={styles.cancelButton}
          onClick={cancelSubscription}
          type="button"
        >
          Cancel Subscription
        </button>
      </div>

      <section className={styles.history}>
        <h3>Billing History</h3>
        <ul>
          {history.map((h, i) => (
            <li key={i}>
              {h.date} — {h.amount}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default SubscriptionSettings
