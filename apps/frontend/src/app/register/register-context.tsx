"use client"

import type { BillingCycle, PlanId, PRICING } from "@ab/shared/pricing"

import { createContext, use, useMemo, useState } from "react"

import type { CreateAccountSchema } from "./register-form"

interface RegisterContextType {
  createAccountState: CreateAccountSchema | null
  setCreateAccountState: (state: CreateAccountSchema | null) => void
  selectedPlan: PlanId | null
  setSelectedPlan: (planId: PlanId | null) => void
  billingCycle: BillingCycle
  setBillingCycle: (cycle: BillingCycle) => void
}

const RegisterContext = createContext<RegisterContextType | null>(null)

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [createAccountState, setCreateAccountState] =
    useState<CreateAccountSchema | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<
    (typeof PRICING)[number]["id"] | null
  >(null)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly",
  )

  const contextValue = useMemo(() => {
    return {
      createAccountState,
      setCreateAccountState,
      selectedPlan,
      setSelectedPlan,
      billingCycle,
      setBillingCycle,
    }
  }, [createAccountState, selectedPlan, billingCycle])

  return <RegisterContext value={contextValue}>{children}</RegisterContext>
}

export function useRegisterContext() {
  const context = use(RegisterContext)
  if (!context) {
    throw new Error("useRegisterContext must be used within a RegisterProvider")
  }
  return context
}
