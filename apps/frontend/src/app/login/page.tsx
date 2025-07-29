// src/app/login/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = { /* … same metadata … */ };

// dynamically load the client form UI
const LoginForm = dynamic(() => import('./LoginForm'));

export default async function LoginPageWrapper() {
  const session = await getServerSession(authOptions);
  if (session) {
    // already logged in?
    redirect('/dashboard');
  }
  return <LoginForm />;
}
