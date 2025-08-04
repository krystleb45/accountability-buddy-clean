// src/components/LandingPricingSection.tsx
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import React, { useState } from "react"

import useSubscription from "@/hooks/useSubscription"

export default function LandingPricingSection() {
  const { plans, loading, error } = useSubscription()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  )

  // Loading state
  if (loading) {
    return (
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-green-400"></div>
          <p className="text-gray-400">Loading pricing plans...</p>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-red-400">Unable to load pricing plans</p>
          <p className="text-sm text-gray-500">
            Please refresh the page or try again later
          </p>
        </div>
      </section>
    )
  }

  // No plans available
  if (!plans || plans.length === 0) {
    return (
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-gray-400">Pricing plans coming soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-green-400 md:text-5xl">
            Choose Your Path to Success
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-300 md:text-xl">
            Whether you're just starting your journey or ready to take it to the
            next level, we have a plan that fits your goals and budget.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-md px-6 py-2 transition-all ${
                  billingCycle === "monthly"
                    ? "bg-green-500 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`rounded-md px-6 py-2 transition-all ${
                  billingCycle === "yearly"
                    ? "bg-green-500 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-2 rounded bg-green-400 px-2 py-1 text-xs text-black">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              className={`relative rounded-xl border-2 bg-gray-800 p-6 transition-all duration-300 hover:scale-105 ${
                plan.isPopular
                  ? "border-green-400 shadow-lg shadow-green-400/20"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-green-400 px-4 py-1 text-sm font-bold text-black">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6 text-center">
                <h3 className="mb-2 text-xl font-bold text-white">
                  {plan.name}
                </h3>
                <div className="mb-3">
                  {plan.trialDays && plan.price === 0 ? (
                    <div>
                      <span className="text-3xl font-bold text-green-400">
                        Free
                      </span>
                      <p className="text-sm text-gray-400">
                        {plan.trialDays} days
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-white">
                        $
                        {billingCycle === "yearly" && plan.yearlyPrice
                          ? plan.yearlyPrice
                          : plan.price}
                      </span>
                      <span className="text-gray-400">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                      {billingCycle === "yearly" && plan.yearlyPrice && (
                        <p className="mt-1 text-sm text-green-400">
                          Save ${plan.price * 12 - plan.yearlyPrice}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg
                      className="mr-3 mt-0.5 size-5 shrink-0 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-lg px-4 py-3 font-semibold transition-all ${
                    plan.isPopular || (plan.trialDays && plan.price === 0)
                      ? "bg-green-400 text-black hover:bg-green-300"
                      : "border border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {plan.trialDays && plan.price === 0
                    ? "Start Free Trial"
                    : `Choose ${plan.name}`}
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
          className="mt-12 space-y-4 text-center"
        >
          <p className="text-gray-400">
            ✅ 7-day money-back guarantee • ✅ Cancel anytime • ✅ Secure
            payment
          </p>
          <p className="text-sm text-gray-500">
            Join thousands of users achieving their goals with accountability
            partners
          </p>
        </motion.div>
      </div>
    </section>
  )
}
