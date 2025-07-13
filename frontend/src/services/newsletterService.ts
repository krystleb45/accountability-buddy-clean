// src/services/newsletterService.ts
import axios from 'axios';
import { http } from '@/utils/http';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const NewsletterService = {
  /**
   * Sign up an email to the newsletter.
   * POST /newsletter/signup
   */
  async signup(email: string): Promise<ApiResponse<null>> {
    if (!email.trim()) {
      throw new Error('Email is required to sign up for the newsletter.');
    }
    try {
      const resp = await http.post<ApiResponse<null>>('/newsletter/signup', { email });
      return resp.data;
    } catch (err: unknown) {
      console.error('❌ [NewsletterService.signup]', err);
      if (axios.isAxiosError(err) && err.response) {
        const errData = err.response.data as ApiResponse<null>;
        return {
          success: false,
          message: errData.message || 'Failed to sign up for newsletter.',
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred.',
      };
    }
  },
};

export default NewsletterService;
