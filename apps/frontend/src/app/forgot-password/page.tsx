// src/app/auth-pages/forgot-password/page.tsx
import ForgotPasswordForm from './page.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password • Accountability Buddy',
  description: 'Request a password reset link to your registered email.',
  openGraph: {
    title: 'Forgot Password • Accountability Buddy',
    description: 'Request a password reset link to your registered email.',
    url: 'https://your-domain.com/forgot-password',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgot Password • Accountability Buddy',
    description: 'Request a password reset link to your registered email.',
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
