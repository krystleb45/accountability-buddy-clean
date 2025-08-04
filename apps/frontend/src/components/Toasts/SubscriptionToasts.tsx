// src/components/Toasts/SubscriptionToasts.ts
"use client"

import type { ToastOptions } from "react-toastify"

import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { toast } from "react-toastify"

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
}

/**
 * 🎉 Show when user successfully upgrades their plan
 */
export function showUpgradeSuccessToast(
  planName: string,
  prorationAmount?: number,
): void {
  toast.success(
    <div>
      <TrendingUp className="mr-2 inline-block text-green-400" size={18} />
      <strong>Upgrade Successful!</strong>
      <div className="text-sm text-white">
        Welcome to {planName}! 🎉
        {prorationAmount && prorationAmount > 0 && (
          <div>Prorated charge: ${prorationAmount}</div>
        )}
      </div>
    </div>,
    { ...baseOptions, autoClose: 6000 },
  )
}

/**
 * 📅 Show when user schedules a downgrade
 */
export function showDowngradeScheduledToast(
  planName: string,
  effectiveDate: string,
): void {
  toast.info(
    <div>
      <TrendingDown className="mr-2 inline-block text-blue-400" size={18} />
      <strong>Downgrade Scheduled</strong>
      <div className="text-sm text-white">
        Will switch to {planName} on{" "}
        {new Date(effectiveDate).toLocaleDateString()}
      </div>
    </div>,
    { ...baseOptions, autoClose: 6000 },
  )
}

/**
 * 🔄 Show when billing cycle changes
 */
export function showBillingCycleChangeToast(
  cycle: string,
  effectiveDate: string,
): void {
  toast.info(
    <div>
      <CreditCard className="mr-2 inline-block text-blue-400" size={18} />
      <strong>Billing Updated</strong>
      <div className="text-sm text-white">
        Changed to {cycle} billing. Effective{" "}
        {new Date(effectiveDate).toLocaleDateString()}
      </div>
    </div>,
    { ...baseOptions },
  )
}

/**
 * ✅ Show successful subscription cancellation
 */
export function showCancellationSuccessToast(): void {
  toast.success(
    <div>
      <CheckCircle2 className="mr-2 inline-block text-green-400" size={18} />
      <strong>Subscription Cancelled</strong>
      <div className="text-sm text-white">
        You'll keep access until your current period ends
      </div>
    </div>,
    { ...baseOptions },
  )
}

/**
 * ❌ Show subscription-related errors
 */
export function showSubscriptionErrorToast(message: string): void {
  toast.error(
    <div>
      <AlertTriangle className="mr-2 inline-block text-red-400" size={18} />
      <strong>Subscription Error</strong>
      <div className="text-sm text-white">{message}</div>
    </div>,
    { ...baseOptions, autoClose: 7000 },
  )
}

/**
 * ⚠️ Show when user hits subscription limits
 */
export function showLimitReachedToast(
  limitType: string,
  currentPlan: string,
): void {
  toast.warning(
    <div>
      <AlertTriangle className="mr-2 inline-block text-yellow-400" size={18} />
      <strong>Limit Reached</strong>
      <div className="text-sm text-white">
        {limitType} limit reached on {currentPlan} plan. Consider upgrading!
      </div>
    </div>,
    { ...baseOptions, autoClose: 6000 },
  )
}
