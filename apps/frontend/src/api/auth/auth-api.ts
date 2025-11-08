import type { BillingCycle, PlanId } from "@ab/shared/pricing"

import { signOut } from "next-auth/react"

import type { CreateAccountSchema } from "@/app/register/register-form"
import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

import { createActivity } from "../activity/activity-api"

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
    const resp =
      await http.get<Envelope<{ user: User & { timezone: string } }>>(
        "/auth/me",
      )
    return resp.data.data.user
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Logout the current user
 */
export async function logout() {
  try {
    await createActivity({
      type: "logout",
      description: "Logged out",
    })
    return await signOut({
      callbackUrl: "/login",
      redirect: false,
    })
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
