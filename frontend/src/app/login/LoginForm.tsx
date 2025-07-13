// src/app/login/LoginForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AuthErrorMessages {
  SessionRequired: string;
  CredentialsSignin: string;
  default: string;
}

const messages: AuthErrorMessages = {
  SessionRequired: 'You must be logged in to view that page.',
  CredentialsSignin: 'Invalid email or password.',
  default: '',
};

export default function LoginForm(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  const callbackUrl = params.get('callbackUrl') ?? '/dashboard';
  const errorParam = params.get('error') ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Map NextAuth error codes into our whitelist of messages
  useEffect(() => {
    if (!errorParam) return;
    const key = errorParam as keyof AuthErrorMessages;
    const msg = messages[key] ?? messages.default;
    if (msg) setError(msg);
  }, [errorParam]);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    const { signIn } = (await import('next-auth/react')) as any
    const res = await signIn('credentials', {
      redirect: false,
      callbackUrl,
      email,
      password,
    })
    if (res?.error) {
      setError(messages.CredentialsSignin)
    } else {
      router.push(res?.url ?? callbackUrl)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error
      ? err.message
      : 'An unexpected error occurred. Please try again.'
    setError(msg)
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-lg bg-gray-900 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-kelly-green">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-gray-800 p-3 text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-gray-800 p-3 text-white"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="text-center text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 text-white ${
              loading
                ? 'cursor-not-allowed bg-kelly-green bg-opacity-50'
                : 'bg-kelly-green hover:bg-opacity-80'
            }`}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-gray-400">
          <p>
            Forgot password?{' '}
            <Link href="/forgot-password" className="text-kelly-green underline">
              Reset here
            </Link>
          </p>
          <p>
            Don’t have an account?{' '}
            <Link href="/register" className="text-kelly-green underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
