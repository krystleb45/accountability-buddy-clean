// src/auth/authApi.ts - Updated with subscription support

// Only import the AxiosError *type* for error narrowing
import type { AxiosError } from "axios"

import { http } from "@/lib/http"

// ---------------------
// Type Definitions
// ---------------------

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    role: string
    subscriptionTier: string
    subscription_status: string
    trial_end_date?: string
    isInTrial: boolean
  }
}

// Updated to include subscription fields
export interface RegisterRequest {
  name: string
  email: string
  password: string
  selectedPlan?: string
  billingCycle?: "monthly" | "yearly"
}

export interface RegisterResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    role: string
    subscriptionTier: string
    subscription_status: string
    trial_end_date: string
  }
}

export interface LogoutResponse {
  message: string
}

// Matches the envelope returned by your Express controllers:
// {
//   success: boolean
//   message?: string
//   data?: T
// }
interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
}

// ---------------------
// API Functions
// ---------------------

/**
 * Log in a user and receive a session token (e.g. in JSON body).
 * POST /backend-api/auth/login  →  (rewrites to) POST /auth/login
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    const resp = await http.post<ApiEnvelope<LoginResponse>>(
      "/backend-api/auth/login",
      { email, password },
    )

    if (!resp.data.success) {
      throw new Error(resp.data.message || "Login failed")
    }

    // At this point, data is guaranteed
    return resp.data.data!
  } catch (err: unknown) {
    const error = err as AxiosError<ApiEnvelope<unknown>>
    // If the server returned a 4xx/5xx with a JSON error envelope, grab that message
    const serverMsg =
      error.response?.data?.message ?? error.message ?? "Failed to log in."
    console.error("Login error:", serverMsg)
    throw new Error(serverMsg)
  }
}

/**
 * Register a new user account with subscription plan.
 * POST /backend-api/auth/register  →  (rewrites to) POST /auth/register
 */
export async function register(
  name: string,
  email: string,
  password: string,
  selectedPlan: string = "free-trial",
  billingCycle: "monthly" | "yearly" = "monthly",
): Promise<RegisterResponse> {
  try {
    const resp = await http.post<ApiEnvelope<RegisterResponse>>(
      "/backend-api/auth/register",
      { name, email, password, selectedPlan, billingCycle },
    )

    if (!resp.data.success) {
      throw new Error(resp.data.message || "Registration failed")
    }

    return resp.data.data!
  } catch (err: unknown) {
    const error = err as AxiosError<ApiEnvelope<unknown>>
    const serverMsg =
      error.response?.data?.message ?? error.message ?? "Failed to register."
    console.error("Registration error:", serverMsg)
    throw new Error(serverMsg)
  }
}

/**
 * Register with full request object (for use with forms)
 */
export async function registerWithRequest(
  registerData: RegisterRequest,
): Promise<RegisterResponse> {
  return register(
    registerData.name,
    registerData.email,
    registerData.password,
    registerData.selectedPlan,
    registerData.billingCycle,
  )
}

/**
 * Log out the current user (invalidate their session on the server).
 * POST /backend-api/auth/logout  →  (rewrites to) POST /auth/logout
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    const resp = await http.post<ApiEnvelope<LogoutResponse>>(
      "/backend-api/auth/logout",
    )

    if (!resp.data.success) {
      throw new Error(resp.data.message || "Logout failed")
    }

    // Some APIs return no `data` on logout; in that case `data` might be undefined.
    return resp.data.data ?? { message: resp.data.message || "Logged out" }
  } catch (err: unknown) {
    const error = err as AxiosError<ApiEnvelope<unknown>>
    const serverMsg =
      error.response?.data?.message ?? error.message ?? "Failed to log out."
    console.error("Logout error:", serverMsg)
    throw new Error(serverMsg)
  }
}

/**
 * Get current user information
 * GET /backend-api/auth/me  →  (rewrites to) GET /auth/me
 */
export async function getCurrentUser(): Promise<LoginResponse["user"]> {
  try {
    const resp = await http.get<ApiEnvelope<LoginResponse["user"]>>(
      "/backend-api/auth/me",
    )

    if (!resp.data.success) {
      throw new Error(resp.data.message || "Failed to get user data")
    }

    return resp.data.data!
  } catch (err: unknown) {
    const error = err as AxiosError<ApiEnvelope<unknown>>
    const serverMsg =
      error.response?.data?.message ??
      error.message ??
      "Failed to get user data."
    console.error("Get user error:", serverMsg)
    throw new Error(serverMsg)
  }
}
