"use client"

import type { BillingCycle, PlanId } from "@ab/shared/pricing"

import { useMutation } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { motion } from "motion/react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { register } from "@/api/auth/auth-api"
import { createSubscriptionSession } from "@/api/subscription/subscriptionApi"
import { Pricing } from "@/components/pricing"
import { Button } from "@/components/ui/button"

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

  const {
    mutate: createCheckoutSession,
    isPending: isCreatingCheckoutSession,
  } = useMutation({
    mutationFn: ({
      selectedPlan,
      billingCycle,
    }: {
      selectedPlan: Exclude<PlanId, "free-trial">
      billingCycle: BillingCycle
    }) => createSubscriptionSession(selectedPlan, billingCycle),
    onSuccess: (data) => {
      window.location.assign(data.sessionUrl)
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 5000,
      })
    },
  })

  const { mutate: registerFn, isPending: isRegistering } = useMutation({
    mutationFn: () =>
      register({
        ...createAccountState!,
        selectedPlan: selectedPlan!,
        billingCycle,
      }),
    onSuccess: async () => {
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
      createCheckoutSession({
        selectedPlan: selectedPlan!,
        billingCycle,
      })
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 5000,
      })
    },
  })

  const handleSubmit = async () => {
    registerFn()
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
          <Button
            size="lg"
            asChild
            variant="outline"
            disabled={isRegistering || isCreatingCheckoutSession}
          >
            <Link href="/register">Back</Link>
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isRegistering || isCreatingCheckoutSession}
          >
            {isRegistering ? (
              <>
                <Loader className="animate-spin" /> Creating Account...
              </>
            ) : isCreatingCheckoutSession ? (
              "Redirecting you to Checkout..."
            ) : (
              "Complete Registration"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default ChoosePlanPage
