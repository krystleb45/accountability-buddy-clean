// src/lib/http.ts - Simplified with NextAuth.js integration
"use client"

import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

import axios from "axios"
import { getSession } from "next-auth/react"

// All API requests should go through the Next.js API proxy (not directly to Express).
const BASE_URL = "/api"

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

async function getAccessToken(): Promise<string | null> {
  // Only run on client side
  if (typeof window === "undefined") {
    return null
  }

  try {
    const session = await getSession()
    const token = session?.user?.accessToken

    // Ensure we have a valid token string
    if (typeof token === "string" && token.length > 0) {
      return token
    }

    return null
  } catch (error) {
    console.error("Error getting session token:", error)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Request interceptor: attach Bearer token from NextAuth session
// ─────────────────────────────────────────────────────────────────────────────
http.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await getAccessToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// Response interceptor: handle errors
// ─────────────────────────────────────────────────────────────────────────────
http.interceptors.response.use(
  (resp: AxiosResponse) => {
    return resp
  },
  async (err: unknown): Promise<never> => {
    if (!axios.isAxiosError(err)) {
      console.error("Unknown error in response interceptor:", err)
      throw new Error("An unexpected error occurred.")
    }

    console.error("❌ HTTP Error:", {
      status: err.response?.status,
      url: err.config?.url,
      message: err.response?.data?.message || err.message,
    })

    // Handle different error types
    if (!err.response) {
      console.error("Network error - no response received")
      throw new Error("Network error. Please check your connection.")
    }

    switch (err.response.status) {
      case 401:
        console.error("Authentication failed")
        // NextAuth.js handles session cleanup automatically
        if (typeof window !== "undefined") {
          window.location.href = "/api/auth/signin"
        }
        break
      case 403:
        console.error("Access denied")
        throw new Error("Access denied. Please check your permissions.")
      case 404:
        console.error("Resource not found")
        throw new Error("Requested resource not found.")
      case 500:
        console.error("Server error")
        throw new Error("Server error. Please try again later.")
      default:
        throw new Error(
          err.response.data?.message || "An unexpected error occurred.",
        )
    }

    return Promise.reject(err)
  },
)

export default http
