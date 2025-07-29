// src/app/page.client.tsx - FIXED: Most Popular badge positioning
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Static pricing data for landing page (no API calls needed)
const LANDING_PLANS = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    description: 'Perfect for getting started',
    price: 0,
    yearlyPrice: 0,
    features: [
      'Up to 3 goals',
      'Basic goal tracking',
      'Community access',
      '14-day trial period'
    ],
    isPopular: false,
    trialDays: 14
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Great for individuals',
    price: 9,
    yearlyPrice: 89,
    features: [
      'Up to 10 goals',
      'Streak tracking',
      'Goal analytics',
      'Email support'
    ],
    isPopular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Most popular choice',
    price: 19,
    yearlyPrice: 189,
    features: [
      'Unlimited goals',
      'Direct messaging',
      'Private chatrooms',
      'Advanced analytics',
      'Priority support'
    ],
    isPopular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For serious achievers',
    price: 39,
    yearlyPrice: 389,
    features: [
      'Everything in Pro',
      'Weekly accountability meetings',
      'Personal coach access',
      'Custom integrations',
      'White-glove support'
    ],
    isPopular: false
  }
];

function StaticPricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="py-8 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-400 mb-3">
            Choose Your Path to Success
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-6">
            Whether you're just starting your journey or ready to take it to the next level,
            we have a plan that fits your goals and budget.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-green-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-green-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-400 text-black px-2 py-1 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* FIXED: Added extra margin top and overflow visible to container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {LANDING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              className={`relative bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                plan.isPopular
                  ? 'border-green-400 shadow-lg shadow-green-400/20'
                  : 'border-gray-600 hover:border-gray-500'
              } ${
                plan.isPopular ? 'mt-6' : 'mt-0'
              }`}
              style={{
                // FIXED: Ensure the card has enough space for the badge
                paddingTop: plan.isPopular ? '2rem' : '1.5rem'
              }}
            >
              {plan.isPopular && (
                // FIXED: Better positioning for the badge
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-green-400 text-black px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* FIXED: Added extra margin top for popular plans to account for badge */}
              <div className={`text-center mb-6 ${plan.isPopular ? 'mt-2' : ''}`}>
                <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="mb-3">
                  {plan.trialDays && plan.price === 0 ? (
                    <div>
                      <span className="text-3xl font-bold text-green-400">Free</span>
                      <p className="text-gray-400 text-sm">{plan.trialDays} days</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-white">
                        ${billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                      </span>
                      <span className="text-gray-400">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                      {billingCycle === 'yearly' && plan.yearlyPrice && (
                        <p className="text-green-400 text-sm mt-1">
                          Save ${(plan.price * 12) - plan.yearlyPrice}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    plan.isPopular || (plan.trialDays && plan.price === 0)
                      ? 'bg-green-400 text-black hover:bg-green-300'
                      : 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {plan.trialDays && plan.price === 0 ? 'Start Free Trial' : `Choose ${plan.name}`}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12 space-y-4"
        >
          <p className="text-gray-400">
            ✅ 7-day money-back guarantee • ✅ Cancel anytime • ✅ Secure payment
          </p>
          <p className="text-gray-500 text-sm">
            Join thousands of users achieving their goals with accountability partners
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomeClient() {
  const { data: session, status } = useSession();

  // While NextAuth is checking:
  if (status === 'loading') return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <h1 className="mb-6 text-5xl font-bold text-green-400 md:text-6xl lg:text-7xl">
          Welcome to Accountability Buddy
          <span className="inline-block animate-wiggle">👋</span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 md:text-xl lg:text-2xl">
          Join a community of doers and achievers. Track your goals, connect with others, and stay
          motivated.
        </p>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg text-white transition hover:bg-blue-500 md:text-xl"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg bg-green-500 px-8 py-4 text-lg text-white transition hover:bg-green-400 md:text-xl"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-blue-400 px-8 py-4 text-lg text-blue-400 transition hover:bg-blue-400 hover:text-white md:text-xl"
              >
                Already have an account?
              </Link>
            </>
          )}
        </div>

        {/* Scroll indicator for pricing section */}
        {!session?.user && (
          <div className="animate-bounce mt-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
      </section>

      {/* Pricing Section - Only show for non-logged-in users */}
      {!session?.user && <StaticPricingSection />}
    </div>
  );
}
