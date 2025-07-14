// src/components/Forms/Register.tsx
'use client';

import React, { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { validateEmail } from '@/utils/FormsUtils';
import { useRegister } from '@/hooks/useRegister';

interface FormData {
  name: string;
  username: string;      // Added username field
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const { loading, error, success, register } = useRegister();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',          // Added username to initial state
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { name, username, email, password, confirmPassword } = formData;

    // client‐side checks
    if (!name || !username || !email || !password || !confirmPassword) {
      return alert('All fields are required.');
    }
    if (!validateEmail(email)) {
      return alert('Please enter a valid email.');
    }
    if (password.length < 8) {
      return alert('Password must be ≥8 characters.');
    }
    if (password !== confirmPassword) {
      return alert('Passwords do not match.');
    }

    // call hook with all required fields
    await register({ name, username, email, password, confirmPassword });

    // on success, redirect
    if (!error) {
      router.push('/login');
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-lg rounded-lg bg-gray-800 p-6 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="mb-6 text-center text-2xl font-semibold text-green-400">Register</h2>

      {error && <p className="mb-4 text-red-400">{error}</p>}
      {success && <p className="mb-4 text-green-400">{success}</p>}

      <form onSubmit={handleSubmit} noValidate>
        {/** Name **/}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-300" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded bg-gray-700 p-3 text-white"
            placeholder="Your full name"
            required
          />
        </div>

        {/** Username **/}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-300" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full rounded bg-gray-700 p-3 text-white"
            placeholder="Choose a username"
            required
          />
        </div>

        {/** Email **/}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded bg-gray-700 p-3 text-white"
            placeholder="you@example.com"
            required
          />
        </div>

        {/** Passwords **/}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded bg-gray-700 p-3 text-white"
            placeholder="••••••••"
            required
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-300" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded bg-gray-700 p-3 text-white"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-green-500 py-3 font-semibold text-black hover:bg-green-400 disabled:opacity-50"
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
    </motion.div>
  );
};

export default Register;
