import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface SubscriptionInfo {
  tier: User["subscriptionTier"]
  status: User["subscription_status"]
  isInTrial: boolean
  daysUntilTrialEnd: number

  features: {
    hasUnlimitedGoals: boolean
    hasDMMessaging: boolean
    hasPrivateRooms: boolean
    hasWeeklyMeetings: boolean
    hasAdvancedAnalytics: boolean
  }

  limits: {
    goalLimit: number
    currentGoals: number
    canCreateMore: boolean
    goalLimitReached: boolean
  }
}

export interface UpgradePrompt {
  type: "trial_ending" | "trial_reminder" | "goal_limit"
  message: string
  action: "upgrade"
  priority: "high" | "medium" | "low"
}

export interface DashboardStats {
  totalGoals: number
  completedGoals: number
  collaborations: number

  activeGoals: number
  subscription: SubscriptionInfo
  upgradePrompts: Array<UpgradePrompt>

  completionRate: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const resp = await http.get<Envelope<DashboardStats>>("/dashboard/stats")
    return resp.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}
