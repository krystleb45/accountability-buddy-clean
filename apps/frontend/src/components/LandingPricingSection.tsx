// src/components/LandingPricingSection.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useSubscription from '@/hooks/useSubscription'

export default function LandingPricingSection() {
  const { plans, loading, error } = useSubscription()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // Loading state
  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading pricing plans...</p>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-400 mb-4">Unable to load pricing plans</p>
          <p className="text-gray-500 text-sm">Please refresh the page or try again later</p>
        </div>
      </section>
    )
  }

  // No plans available
  if (!plans || plans.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">Pricing plans coming soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-400 mb-6">
            Choose Your Path to Success
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8">
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
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
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
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
  )
}
