// src/newsletter/newsletterApi.ts

import axios from "axios"

import { http } from "@/lib/http"

/**
 * Subscribe an email to the newsletter.
 * Returns `true` on success, `false` on failure.
 */
export async function subscribeNewsletter(email: string): Promise<boolean> {
  if (!email.trim()) {
    console.error("[newsletterApi::subscribeNewsletter] email is required")
    return false
  }
  try {
    const resp = await http.post<{ success: boolean; message?: string }>(
      "/newsletter/signup",
      {
        email,
      },
    )
    return resp.data.success
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "[newsletterApi::subscribeNewsletter]",
        err.response?.data || err.message,
      )
    } else {
      console.error("[newsletterApi::subscribeNewsletter]", err)
    }
    return false
  }
}

export default {
  subscribeNewsletter,
}
