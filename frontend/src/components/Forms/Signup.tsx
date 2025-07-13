'use client';

import React, { useState, useCallback } from 'react';
import { trackEvent } from '@/services/googleAnalytics';
import { validateEmail } from '../../utils/FormsUtils';
import { motion } from 'framer-motion';

/** Form data for signup */
interface SignupFormData {
  email: string;
  password: string;
}

/**
 * Signup component with Google Analytics event tracking.
 */
const Signup: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({ email: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSignup = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      const { email, password } = formData;
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        trackEvent('Signup', { event_label: 'User signed up successfully' });
        setSuccess('Sign-up successful! Welcome aboard.');
        setFormData({ email: '', password: '' });
      } catch (err) {
        console.error('Sign-up failed:', err);
        setError('Sign-up failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData],
  );

  return (
    <motion.div
      className="mx-auto w-full max-w-lg rounded-lg bg-gray-800 p-6 shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-6 text-center text-2xl font-semibold text-green-400">Sign Up</h2>
      {error && <p className="mb-4 text-center text-red-500">{error}</p>}
      {success && <p className="mb-4 text-center text-green-400">{success}</p>}
      <form onSubmit={handleSignup} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full rounded-md bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="mb-2 block text-sm text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full rounded-md bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-green-500 py-3 text-black transition hover:bg-green-400 disabled:opacity-50"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </motion.div>
  );
};

export default Signup;
