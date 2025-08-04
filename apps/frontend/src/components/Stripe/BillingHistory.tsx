// src/components/Stripe/BillingHistory.tsx
"use client"

import React, { useEffect, useState } from "react"

import { fetchBillingHistory } from "@/utils/apiUtils" // assuming `@/` maps to `src/`

import type { BillingHistoryItem } from "../../types/Stripe.types"

import styles from "./BillingHistory.module.css"

const BillingHistory: React.FC = () => {
  const [history, setHistory] = useState<BillingHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await fetchBillingHistory() // fetchBillingHistory(): Promise<BillingHistoryItem[]>
        setHistory(data)
      } catch (err: unknown) {
        console.error(err)
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load billing history.",
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return <p className={styles.loading}>Loading billing history…</p>
  }
  if (error) {
    return (
      <p className={styles.error} role="alert" aria-live="assertive">
        {error}
      </p>
    )
  }
  if (history.length === 0) {
    return <p className={styles.noHistory}>No billing history available.</p>
  }

  return (
    <section className={styles.container} aria-labelledby="bh-heading">
      <h2 id="bh-heading" className={styles.heading}>
        Billing History
      </h2>
      <table className={styles.table} aria-describedby="bh-heading">
        <caption className="sr-only">Previous billing transactions</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Description</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map(({ id, date, description, amount, status }) => (
            <tr key={id}>
              <td>{new Date(date).toLocaleDateString()}</td>
              <td>{description}</td>
              <td>
                {(amount / 100).toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
              </td>
              <td
                className={`${styles.status} ${styles[status.toLowerCase()] ?? ""}`}
              >
                {status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default BillingHistory
