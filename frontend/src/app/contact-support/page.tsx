// src/app/contact-support/page.tsx
import ContactSupportForm from './page.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support • Accountability Buddy',
  description:
    'Need help? Reach out to Accountability Buddy’s support team for assistance with your account, challenges, or any other questions.',
  openGraph: {
    title: 'Contact Support • Accountability Buddy',
    description:
      'Need help? Reach out to Accountability Buddy’s support team for assistance with your account, challenges, or any other questions.',
    url: 'https://your-domain.com/contact-support',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Support • Accountability Buddy',
    description:
      'Need help? Reach out to Accountability Buddy’s support team for assistance with your account, challenges, or any other questions.',
  },
};

export default function ContactSupportPage() {
  return <ContactSupportForm />;
}
