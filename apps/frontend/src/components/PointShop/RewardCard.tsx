import Image from "next/image"
import React from "react"

import type { Reward } from "../../types/Rewards.types"

interface RewardCardProps {
  reward: Reward
  onRedeem: () => void
  disabled: boolean
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onRedeem,
  disabled,
}) => {
  return (
    <div
      className={`
        flex flex-col justify-between rounded-lg bg-gray-800 p-4 shadow-lg
      `}
      role="group"
      aria-labelledby={`reward-title-${reward._id}`}
    >
      {reward.imageUrl ? (
        <Image
          src={reward.imageUrl}
          alt={reward.title}
          className="mb-4 h-32 w-full rounded object-cover"
          width={128}
          height={128}
        />
      ) : (
        <div className="mb-4 h-32 w-full rounded bg-gray-700" />
      )}

      <h3
        id={`reward-title-${reward._id}`}
        className="mb-2 text-xl font-bold text-white"
      >
        {reward.title}
      </h3>

      <p className="mb-4 text-gray-400">{reward.pointsRequired} points</p>

      <button
        type="button"
        onClick={onRedeem}
        disabled={disabled}
        aria-disabled={disabled}
        aria-label={
          disabled
            ? `Cannot redeem ${reward.title}, not enough points`
            : `Redeem ${reward.title} for ${reward.pointsRequired} points`
        }
        className={`
          rounded-lg px-4 py-2 text-white transition
          ${disabled ? "cursor-not-allowed bg-gray-600" : `bg-primary/80`}
        `}
      >
        {disabled ? "Insufficient Points" : "Redeem"}
      </button>
    </div>
  )
}

export default RewardCard
