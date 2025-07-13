// src/app/register/page.client.tsx - Final version using your existing API structure
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSubscriptionSession } from '@/api/subscription/subscriptionApi';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Plan {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  popular: boolean;
  buttonText: string;
}

const PLANS: Plan[] = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    price: { monthly: 0, yearly: 0 },
    description: 'Full access to get you started',
    features: [
      'All Pro features included',
      'Full community access',
      'Unlimited goals',
      'Badge system & XP',
      'DM messaging',
      'No commitment'
    ],
    popular: false,
    buttonText: 'Start Free Trial'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 5, yearly: 50 },
    description: 'Perfect for beginners',
    features: [
      '3 active goals',
      'Streak tracker',
      'Daily prompts',
      'Group chat access',
      'Basic progress tracking'
    ],
    popular: false,
    buttonText: 'Choose Basic'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 15, yearly: 150 },
    description: 'Most popular choice',
    features: [
      'Unlimited goals',
      'Full community access',
      'Badge system & XP',
      'DM messaging',
      'Advanced analytics',
      'Priority support'
    ],
    popular: true,
    buttonText: 'Choose Pro'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: { monthly: 30, yearly: 300 },
    description: 'For serious achievers',
    features: [
      'Everything in Pro',
      'Private chatrooms',
      'Early feature access',
      'Leaderboard perks',
      'Weekly accountability meetings',
      'Personal coach matching'
    ],
    popular: false,
    buttonText: 'Choose Elite'
  }
];

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('free-trial');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleStep1Submit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError('');

    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePlanSelect = (planId: string): void => {
    setSelectedPlan(planId);
  };

  const handleFinalSubmit = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      // Use your existing API route
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          selectedPlan,
          billingCycle
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration successful:', data);

      // If free trial, redirect to dashboard
      if (selectedPlan === 'free-trial') {
        router.push('/dashboard');
        return;
      }

      // For paid plans, create checkout session
      const sess = await createSubscriptionSession(selectedPlan, billingCycle);
      if (sess?.sessionUrl) {
        window.location.href = sess.sessionUrl;
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
                <h1 className="text-3xl font-bold text-center text-kelly-green mb-6">
                  Create Account
                </h1>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-kelly-green"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-kelly-green"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-kelly-green"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-kelly-green"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-kelly-green hover:bg-kelly-green/80 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Continue to Plan Selection
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-kelly-green hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-kelly-green mb-4">Choose Your Plan</h2>
                <p className="text-gray-300 text-lg">
                  Welcome {formData.name}! Select a plan to get started with AccountabilityBuddy
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm max-w-2xl mx-auto">
                  {error}
                </div>
              )}

              {/* Billing Cycle Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-800 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-md transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-kelly-green text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-md transition-all ${
                      billingCycle === 'yearly'
                        ? 'bg-kelly-green text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Yearly
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {PLANS.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative bg-gray-800 rounded-lg p-6 border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                      selectedPlan === plan.id
                        ? 'border-kelly-green bg-gray-700'
                        : plan.popular
                        ? 'border-kelly-green/50'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-kelly-green text-black px-3 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="mb-2">
                        {plan.price.monthly === 0 ? (
                          <span className="text-3xl font-bold text-kelly-green">Free</span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-white">
                              ${billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                            </span>
                            <span className="text-gray-400">
                              /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="w-5 h-5 text-kelly-green mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        selectedPlan === plan.id
                          ? 'bg-kelly-green text-black'
                          : plan.popular
                          ? 'bg-kelly-green hover:bg-kelly-green/80 text-black'
                          : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan.id);
                      }}
                    >
                      {selectedPlan === plan.id ? '✓ Selected' : plan.buttonText}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-kelly-green text-black font-semibold rounded-lg hover:bg-kelly-green/80 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>

              <div className="text-center mt-8">
                <p className="text-gray-400 text-sm">
                  ✅ 14-day free trial • ✅ Cancel anytime • ✅ Secure payment
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
