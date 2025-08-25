"use client"

import React, { useCallback, useEffect, useState } from "react"

import "./SubscriptionStatus.css" // your existing styles

const SubscriptionStatus: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  )
  // const [subscriptionStatus, setSubscriptionStatus] = useState<string>(
  //   "No active subscription",
  // )
  const [error, setError] = useState<string>("")

  const fetchStatus = useCallback(async () => {
    setError("")
    setStatus("loading")

    try {
      // const result = await SubscriptionService.getRealTimeStatus()
      // setSubscriptionStatus(result.status ?? "No active subscription")
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
    <div>
      <h2>Subscription Status</h2>
      {status === "loading" && <p>Loading...</p>}
      {status === "error" && <p>{error}</p>}
      {/* {status === "success" && <p>{subscriptionStatus}</p>} */}
      <button
        type="button"
        onClick={() => void fetchStatus()}
        disabled={status === "loading"}
      >
        Refresh Status
      </button>
    </div>
  )
}

export default SubscriptionStatus
