"use client"

import type { ToastOptions } from "react-toastify"

import { Award, CheckCircle2, Star } from "lucide-react"
import "react-toastify/dist/ReactToastify.css"
import React from "react"
import { toast, ToastContainer } from "react-toastify"

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
}

/**
 * 🔔 Show when a new badge is unlocked.
 */
export function showBadgeUnlockToast(badgeName: string): void {
  toast.success(
    <div>
      <Award className="mr-2 inline-block text-yellow-400" size={18} />
      <strong>New Badge Unlocked!</strong>
      <div className="text-sm text-white">🏅 {badgeName}</div>
    </div>,
    { ...baseOptions },
  )
}

/**
 * 🔔 Show when the user levels up.
 */
export function showLevelUpToast(level: number): void {
  toast.info(
    <div>
      <Star className="mr-2 inline-block text-green-400" size={18} />
      <strong>Level Up!</strong>
      <div className="text-sm text-white">You reached Level {level} 🚀</div>
    </div>,
    { ...baseOptions },
  )
}

/**
 * 🔔 A generic notification.
 */
export function showGenericToast(message: string): void {
  toast(
    <div>
      <CheckCircle2 className="mr-2 inline-block text-blue-400" size={18} />
      {message}
    </div>,
    baseOptions,
  )
}

/**
 * Place once (usually near the root of your app)
 * to render the toast container.
 */
export const ToastNotificationContainer: React.FC = () => (
  <ToastContainer limit={3} />
)
