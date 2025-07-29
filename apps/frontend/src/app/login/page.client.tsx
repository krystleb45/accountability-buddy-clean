// File: app/login/page.tsx
import React from 'react';
import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Login – Accountability Buddy',
  description:
    'Log in to your Accountability Buddy account to track goals and connect with friends.',
  openGraph: {
    title: 'Login – Accountability Buddy',
    description:
      'Log in to your Accountability Buddy account to track goals and connect with friends.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
