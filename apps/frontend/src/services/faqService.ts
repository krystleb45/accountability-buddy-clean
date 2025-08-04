// src/services/faqService.ts

import type { Faq } from "@/api/faq/faqApi"

import { fetchFaqs as _fetchFaqs } from "@/api/faq/faqApi"

const FaqService = {
  /** Fetch all FAQ items */
  async getAll(): Promise<Faq[]> {
    return _fetchFaqs()
  },
}

export default FaqService
