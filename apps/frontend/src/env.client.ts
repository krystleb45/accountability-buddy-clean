// src/env.client.ts

// Expose only the public vars you actually need on the browser:
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string
export const STRIPE_PUBLIC_KEY = process.env
  .NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
// …etc.

// Optionally validate at runtime:
if (!API_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL")
}
