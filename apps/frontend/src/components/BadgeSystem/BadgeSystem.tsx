'use client';

import React from 'react';
import styles from './BadgeSystem.module.css';

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface BadgeSystemProps {
  badges: BadgeData[];
  user?: { id: string; name: string };
}

/**
 * A gallery of user badges. Shows a heading with the user’s name if provided,
 * an empty-state message when there are no badges, or a list of badges.
 */
const BadgeSystem: React.FC<BadgeSystemProps> = ({ badges, user }) => {
  return (
    <div className={styles.badgeSystemContainer} data-testid="badge-system">
      <h2 className={styles.userGreeting}>{user ? `Badges for ${user.name}` : 'Badges'}</h2>

      {badges.length === 0 ? (
        <p className={styles.emptyMessage} role="alert" data-testid="empty-message">
          No badges available.
        </p>
      ) : (
        <ul className={styles.badgeList} aria-label="List of badges">
          {badges.map((badge) => (
            <li key={badge.id} className={styles.badgeItem} data-testid="badge-item">
              <img src={badge.imageUrl} alt={badge.name} className={styles.badgeImage} />
              <div className={styles.badgeDetails}>
                <h3 className={styles.badgeName}>{badge.name}</h3>
                <p className={styles.badgeDescription}>{badge.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BadgeSystem;
