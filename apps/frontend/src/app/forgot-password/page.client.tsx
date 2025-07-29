// src/app/auth-pages/forgot-password/page.client.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Failed to send reset link');
      }
      setSubmitted(true);
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
          Forgot Password
        </h1>

        {submitted ? (
          <p className="text-center text-green-400">
            If that email is registered, you’ll receive a reset link shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-center text-red-500">{error}</p>}
            <div>
              <label htmlFor="email" className="mb-1 block font-medium text-gray-300">
                Enter your email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-kelly-green focus:outline-none focus:ring focus:ring-green-200"
                placeholder="you@example.com"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full rounded-lg bg-kelly-green py-3 text-black transition hover:bg-opacity-80"
            >
              Send Reset Link
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
