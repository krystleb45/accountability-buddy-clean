// src/components/BadgeSystem/EarnBadgeNotification.tsx
'use client';

import React from 'react';
import './EarnBadgeNotification.css';

export interface EarnBadgeNotificationProps {
  badgeName: string;
  badgeIcon: string;
  message?: string;
  onClose: () => void;
  onViewDetails?: () => void;
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
    <div className="earn-badge-notification" role="alert" aria-live="assertive">
      <div className="notification-content">
        <img src={badgeIcon} alt={`${badgeName} badge icon`} className="badge-icon" />
        <div>
          <h3 className="notification-title">{message}</h3>
          <p className="badge-name">Badge: {badgeName}</p>
        </div>
      </div>

      <div className="notification-actions">
        {onViewDetails && (
          <button
            type="button"
            className="notification-button view-details"
            onClick={onViewDetails}
            aria-label="View badge details"
          >
            View Details
          </button>
        )}

        <button
          type="button"
          className="notification-button close"
          onClick={onClose}
          aria-label="Close notification"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EarnBadgeNotification;
