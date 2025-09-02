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
    trialDays: 14,
  },
  {
    id: "basic",
    name: "Basic",
    price: { monthly: 5, yearly: 50 },
    description: "Perfect for beginners",
    features: [
      "3 goals",
      "Streak tracker",
      "Daily prompts",
      "Group chat access",
      "Basic progress tracking",
    ],
    isPopular: false,
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
    isPopular: true,
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
    isPopular: false,
    buttonText: "Choose Elite",
  },
] as const

export type PlanId = (typeof PRICING)[number]["id"]
export type BillingCycle = "monthly" | "yearly"
