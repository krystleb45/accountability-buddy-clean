"use client"

import { motion } from "motion/react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { createSubscriptionSession } from "@/api/subscription/subscriptionApi"
import { Pricing } from "@/components/pricing"
import { Button } from "@/components/ui/button"
import { http } from "@/utils"

import { useRegisterContext } from "../register-context"

function ChoosePlanPage() {
  const {
    createAccountState,
    selectedPlan,
    setSelectedPlan,
    billingCycle,
    setBillingCycle,
  } = useRegisterContext()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
      })
    }
  }, [error])

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await http.post("/auth/register", {
        name: createAccountState?.name,
        username: createAccountState?.name.toLowerCase().replace(/\s+/g, ""), // Generate username from name
        email: createAccountState?.email,
        password: createAccountState?.password,
        confirmPassword: createAccountState?.confirmPassword,
        selectedPlan,
        billingCycle,
      })

      const data = response.data

      if (!data.success) {
        throw new Error(data.message || "Registration failed")
      }

      await signIn("credentials", {
        email: createAccountState?.email,
        password: createAccountState?.password,
        redirect: false,
      })

      // If free trial, redirect to dashboard
      if (selectedPlan === "free-trial") {
        router.push("/dashboard")
        return
      }

      // For paid plans, create checkout session
      const sess = await createSubscriptionSession(selectedPlan!, billingCycle)
      if (sess?.sessionUrl) {
        window.location.href = sess.sessionUrl
      } else {
        throw new Error("Failed to create payment session")
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Registration failed. Please try again.")
      setLoading(false)
    }
  }

  if (!createAccountState) {
    router.push("/register")
    return null
  }

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Pricing
        onCtaClick={(id) => setSelectedPlan(id)}
        title="Choose Your Plan"
        subtitle={`Welcome ${createAccountState.name}! Select a plan to get started with
          AccountabilityBuddy`}
        selectedPlan={selectedPlan}
        onBillingCycleChange={setBillingCycle}
      />
      <div className="mt-8">
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild variant="outline" disabled={loading}>
            <Link href="/register">Back</Link>
          </Button>
          <Button size="lg" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating Account..." : "Complete Registration"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default ChoosePlanPage
