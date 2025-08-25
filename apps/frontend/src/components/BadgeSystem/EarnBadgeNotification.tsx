"use client"

import Image from "next/image"

import "./EarnBadgeNotification.css"
import React from "react"

export interface EarnBadgeNotificationProps {
  badgeName: string
  badgeIcon: string
  message?: string
  onClose: () => void
  onViewDetails?: () => void
}

/**
 * A dismissible notification shown when the user earns a badge.
 * It announces itself to assistive technologies (aria-live="assertive").
 */
const EarnBadgeNotification: React.FC<EarnBadgeNotificationProps> = ({
  badgeName,
  badgeIcon,
  message = `Congratulations! You've earned a new badge!`,
  onClose,
  onViewDetails,
}): React.ReactElement => {
  return (
    <div role="alert" aria-live="assertive">
      <div>
        <Image src={badgeIcon} alt={`${badgeName} badge icon`} />
        <div>
          <h3>{message}</h3>
          <p>Badge: {badgeName}</p>
        </div>
      </div>

      <div>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            aria-label="View badge details"
          >
            View Details
          </button>
        )}

        <button type="button" onClick={onClose} aria-label="Close notification">
          Close
        </button>
      </div>
    </div>
  )
}

export default EarnBadgeNotification
