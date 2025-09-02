import type { BillingCycle, PlanId } from "@ab/shared/pricing"

import type { CreateAccountSchema } from "@/app/register/register-form"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

/**
 * Register a new user account with subscription plan.
 */
export async function register(
  data: Omit<CreateAccountSchema, "confirmPassword"> & {
    selectedPlan: PlanId
    billingCycle: BillingCycle
  },
) {
  try {
    await http.post("/auth/register", data)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function sendVerificationEmail() {
  try {
    await http.post("/auth/send-verification-email")
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
