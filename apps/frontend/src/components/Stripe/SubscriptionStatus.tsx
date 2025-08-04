// src/components/SubscriptionStatus.tsx
"use client"

import React, { useCallback, useEffect, useState } from "react"
import SubscriptionService from "src/services/subscriptionService"

import "./SubscriptionStatus.css" // your existing styles

const SubscriptionStatus: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  )
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>(
    "No active subscription",
  )
  const [error, setError] = useState<string>("")

  const fetchStatus = useCallback(async () => {
    setError("")
    setStatus("loading")

    try {
      const result = await SubscriptionService.getRealTimeStatus()
      setSubscriptionStatus(result.status ?? "No active subscription")
      setStatus("success")
    } catch (err) {
      console.error("Error fetching subscription status:", err)
      setError("Failed to fetch subscription status. Please try again.")
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    void fetchStatus()
  }, [fetchStatus])

  return (
    <div className="subscription-status">
      <h2>Subscription Status</h2>
      {status === "loading" && <p className="loading">Loading...</p>}
      {status === "error" && <p className="error">{error}</p>}
      {status === "success" && <p className="success">{subscriptionStatus}</p>}
      <button
        onClick={() => void fetchStatus()}
        className="refresh-button"
        disabled={status === "loading"}
      >
        Refresh Status
      </button>
    </div>
  )
}

export default SubscriptionStatus
