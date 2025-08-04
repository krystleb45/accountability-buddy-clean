// SubscriptionStatus.tsx
import React, { useCallback, useEffect, useState } from "react"
import SubscriptionService from "src/services/subscriptionService"

import "./SubscriptionStatus.css"

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
      setSubscriptionStatus(result.status || "No active subscription")
      setStatus("success")
    } catch (err) {
      console.error("Error fetching subscription status:", err)
      setError("Failed to fetch subscription status. Please try again.")
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return (
    <div className="subscription-status" aria-live="polite">
      <h2>Subscription Status</h2>
      {status === "loading" && (
        <p className="loading-message" aria-busy="true">
          Loading your subscription status...
        </p>
      )}
      {status === "error" && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {status === "success" && (
        <p className="status-message">{subscriptionStatus}</p>
      )}
      <button
        onClick={fetchStatus}
        className="refresh-button"
        disabled={status === "loading"}
        aria-disabled={status === "loading"}
      >
        Refresh Status
      </button>
    </div>
  )
}

export default SubscriptionStatus
