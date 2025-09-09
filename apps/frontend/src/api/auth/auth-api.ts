import type { BillingCycle, PlanId } from "@ab/shared/pricing"

import type { CreateAccountSchema } from "@/app/register/register-form"
import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

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

export async function fetchMe() {
  try {
    const resp = await http.get<Envelope<{ user: User }>>("/auth/me")
    return resp.data.data.user
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
