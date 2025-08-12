// src/app/register/page.client.tsx - Final version using your existing API structure
"use client"

import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

import { createSubscriptionSession } from "@/api/subscription/subscriptionApi"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface Plan {
  id: string
  name: string
  price: { monthly: number; yearly: number }
  description: string
  features: string[]
  popular: boolean
  buttonText: string
}

const PLANS: Plan[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    price: { monthly: 0, yearly: 0 },
    description: "Full access to get you started",
    features: [
      "All Pro features included",
      "Full community access",
      "Unlimited goals",
      "Badge system & XP",
      "DM messaging",
      "No commitment",
    ],
    popular: false,
    buttonText: "Start Free Trial",
  },
  {
    id: "basic",
    name: "Basic",
    price: { monthly: 5, yearly: 50 },
    description: "Perfect for beginners",
    features: [
      "3 active goals",
      "Streak tracker",
      "Daily prompts",
      "Group chat access",
      "Basic progress tracking",
    ],
    popular: false,
    buttonText: "Choose Basic",
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 15, yearly: 150 },
    description: "Most popular choice",
    features: [
      "Unlimited goals",
      "Full community access",
      "Badge system & XP",
      "DM messaging",
      "Advanced analytics",
      "Priority support",
    ],
    popular: true,
    buttonText: "Choose Pro",
  },
  {
    id: "elite",
    name: "Elite",
    price: { monthly: 30, yearly: 300 },
    description: "For serious achievers",
    features: [
      "Everything in Pro",
      "Private chatrooms",
      "Early feature access",
      "Leaderboard perks",
      "Weekly accountability meetings",
      "Personal coach matching",
    ],
    popular: false,
    buttonText: "Choose Elite",
  },
]

export default function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState("free-trial")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  )
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateStep1 = (): boolean => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    return true
  }

  const handleStep1Submit = (e: React.FormEvent): void => {
    e.preventDefault()
    setError("")

    if (validateStep1()) {
      setStep(2)
    }
  }

  const handlePlanSelect = (planId: string): void => {
    setSelectedPlan(planId)
  }

  const handleFinalSubmit = async (): Promise<void> => {
    setLoading(true)
    setError("")

    try {
      // FIXED: Use correct Railway backend URL and endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            username: formData.name.toLowerCase().replace(/\s+/g, ""), // Generate username from name
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword, // Add confirmPassword
            selectedPlan,
            billingCycle,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed")
      }

      console.log("Registration successful:", data)

      // If free trial, redirect to dashboard
      if (selectedPlan === "free-trial") {
        router.push("/dashboard")
        return
      }

      // For paid plans, create checkout session
      const sess = await createSubscriptionSession(selectedPlan, billingCycle)
      if (sess?.sessionUrl) {
        window.location.href = sess.sessionUrl
      } else {
        throw new Error("Failed to create payment session")
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Registration failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-md"
            >
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-8">
                <h1 className="mb-6 text-center text-3xl font-bold text-kelly-green">
                  Create Account
                </h1>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3 text-sm text-red-200">
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
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder:text-gray-400 focus:border-kelly-green focus:outline-none"
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
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder:text-gray-400 focus:border-kelly-green focus:outline-none"
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
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder:text-gray-400 focus:border-kelly-green focus:outline-none"
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
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder:text-gray-400 focus:border-kelly-green focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-kelly-green px-4 py-3 font-semibold text-black transition-colors hover:bg-kelly-green/80"
                  >
                    Continue to Plan Selection
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-kelly-green hover:underline"
                    >
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
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-kelly-green">
                  Choose Your Plan
                </h2>
                <p className="text-lg text-gray-300">
                  Welcome {formData.name}! Select a plan to get started with
                  AccountabilityBuddy
                </p>
              </div>

              {error && (
                <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-red-500 bg-red-900/50 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Billing Cycle Toggle */}
              <div className="mb-8 flex justify-center">
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-1">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`rounded-md px-6 py-2 transition-all ${
                      billingCycle === "monthly"
                        ? "bg-kelly-green text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`rounded-md px-6 py-2 transition-all ${
                      billingCycle === "yearly"
                        ? "bg-kelly-green text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Yearly
                    <span className="ml-2 rounded bg-green-500 px-2 py-1 text-xs text-white">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {PLANS.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative cursor-pointer rounded-lg border-2 bg-gray-800 p-6 transition-all duration-200 hover:scale-105 ${
                      selectedPlan === plan.id
                        ? "border-kelly-green bg-gray-700"
                        : plan.popular
                          ? "border-kelly-green/50"
                          : "border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-kelly-green px-3 py-1 text-sm font-semibold text-black">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6 text-center">
                      <h3 className="mb-2 text-xl font-bold text-white">
                        {plan.name}
                      </h3>
                      <div className="mb-2">
                        {plan.price.monthly === 0 ? (
                          <span className="text-3xl font-bold text-kelly-green">
                            Free
                          </span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-white">
                              $
                              {billingCycle === "yearly"
                                ? plan.price.yearly
                                : plan.price.monthly}
                            </span>
                            <span className="text-gray-400">
                              /{billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="mb-6 space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg
                            className="mr-2 mt-0.5 size-5 shrink-0 text-kelly-green"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full rounded-lg px-4 py-3 font-semibold transition-colors ${
                        selectedPlan === plan.id
                          ? "bg-kelly-green text-black"
                          : plan.popular
                            ? "bg-kelly-green text-black hover:bg-kelly-green/80"
                            : "border border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlanSelect(plan.id)
                      }}
                    >
                      {selectedPlan === plan.id
                        ? "✓ Selected"
                        : plan.buttonText}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="rounded-lg bg-gray-700 px-6 py-3 text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="rounded-lg bg-kelly-green px-8 py-3 font-semibold text-black transition-colors hover:bg-kelly-green/80 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Complete Registration"}
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  ✅ 14-day free trial • ✅ Cancel anytime • ✅ Secure payment
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
