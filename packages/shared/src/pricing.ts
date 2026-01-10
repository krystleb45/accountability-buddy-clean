export const PRICING = [
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
    isPopular: false,
    buttonText: "Start Free Trial",
    trialDays: 7,
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 14.99, yearly: 149 },
    description: "Everything you need to achieve your goals",
    features: [
      "Unlimited goals",
      "Full community access",
      "Badge system & XP",
      "DM messaging",
      "Streak tracker",
      "Advanced analytics",
      "Priority support",
    ],
    isPopular: true,
    buttonText: "Choose Pro",
  },
] as const

export type PlanId = (typeof PRICING)[number]["id"]
export type BillingCycle = "monthly" | "yearly"