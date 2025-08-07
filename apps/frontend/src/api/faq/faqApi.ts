// src/faq/faqApi.ts
import axios from "axios"

import { http } from "@/lib/http"

// FAQ type
export interface Faq {
  question: string
  answer: string
}

/**
 * Fetch FAQs (Next.js will proxy `/faqs` → BACKEND_URL/faqs`)
 */
export async function fetchFaqs(): Promise<Faq[]> {
  try {
    // ✅ Notice we only request “/faqs” here (http already has base="")
    const resp = await http.get<{
      success: boolean
      message: string
      data: Faq[]
    }>("/faqs")

    return resp.data.data
  } catch (err) {
    console.error(
      "❌ [faqApi::fetchFaqs]",
      axios.isAxiosError(err) ? err.response?.data : err,
    )
    return []
  }
}
