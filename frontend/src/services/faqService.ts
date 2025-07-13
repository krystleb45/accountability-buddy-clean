// src/services/faqService.ts

import { fetchFaqs as _fetchFaqs, Faq } from '@/api/faq/faqApi';

const FaqService = {
  /** Fetch all FAQ items */
  async getAll(): Promise<Faq[]> {
    return _fetchFaqs();
  },
};

export default FaqService;
