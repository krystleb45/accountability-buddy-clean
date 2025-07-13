'use client';

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordForm(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token.');
  }, [token]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Failed to reset password');
      }
      setSubmitted(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md rounded-lg bg-gray-900 p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold text-kelly-green">
          Reset Your Password
        </h1>

        {!token ? (
          <div className="text-center">
            <p className="mb-4 text-red-500">Invalid or missing reset token.</p>
            <Link href="/login" className="text-kelly-green hover:underline">
              Back to Login
            </Link>
          </div>
        ) : submitted ? (
          <div className="text-center text-green-400">
            <h3 className="text-xl font-semibold">Password Reset Successful!</h3>
            <p>Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-center text-red-500">{error}</p>}

            <div>
              <label htmlFor="password" className="mb-1 block font-medium text-gray-300">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded-lg border bg-gray-800 p-3 text-white focus:border-kelly-green focus:outline-none focus:ring focus:ring-green-200"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block font-medium text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg border bg-gray-800 p-3 text-white focus:border-kelly-green focus:outline-none focus:ring focus:ring-green-200"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full rounded-lg bg-kelly-green py-3 text-black transition hover:bg-opacity-80"
            >
              Reset Password
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
