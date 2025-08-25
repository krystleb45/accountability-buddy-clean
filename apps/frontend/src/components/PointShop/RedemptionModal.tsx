"use client"

import React, { useEffect, useRef } from "react"

import type { Reward } from "../../types/Rewards.types"

interface RedemptionModalProps {
  reward: Reward // your UI Reward type must have `id: string`
  isOpen: boolean
  onClose: () => void
  onRedeem: (rewardId: string, pointsRequired: number) => void
  title?: string
}

const RedemptionModal: React.FC<RedemptionModalProps> = ({
  reward,
  isOpen,
  onClose,
  onRedeem,
  title = "Confirm Redemption",
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleRedeem = (): void => {
    onRedeem(reward.id, reward.pointsRequired)
    onClose()
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/50
      `}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="redemption-modal-title"
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()} // satisfies keyboard listener requirement
      >
        <h2 id="redemption-modal-title" className="mb-4 text-xl font-semibold">
          {title}
        </h2>
        <p className="mb-6">
          Redeem <strong>{reward.title}</strong> for{" "}
          <strong>{reward.pointsRequired} points</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`
              rounded bg-gray-200 px-4 py-2 transition
              hover:bg-gray-300
            `}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRedeem}
            className={`
              rounded bg-blue-600 px-4 py-2 text-white transition
              hover:bg-blue-700
            `}
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  )
}

export default RedemptionModal
