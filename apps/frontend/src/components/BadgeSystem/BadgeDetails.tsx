// src/components/BadgeSystem/BadgeDetails.tsx
'use client';

import React from 'react';
import styles from './BadgeDetails.module.css';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // URL or path to the badge icon
  criteria: string; // Explanation of how to earn the badge
  dateEarned?: string; // ISO date string of when the badge was earned
}

export interface BadgeDetailsProps {
  badge: Badge;
  onClose: () => void;
}

const BadgeDetails: React.FC<BadgeDetailsProps> = ({ badge, onClose }) => {
  const { name, description, icon, criteria, dateEarned } = badge;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-details-title"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <img src={icon} alt={`${name} badge icon`} className={styles.icon} />
          <h2 id="badge-details-title" className={styles.title}>
            {name}
          </h2>
        </header>

        <section className={styles.section}>
          <p className={styles.description}>{description}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.subtitle}>How to Earn</h3>
          <p className={styles.criteria}>{criteria}</p>
        </section>

        {dateEarned && (
          <section className={styles.section}>
            <p className={styles.date}>
              Earned on:&nbsp;
              <time dateTime={dateEarned}>{new Date(dateEarned).toLocaleDateString()}</time>
            </p>
          </section>
        )}

        <button onClick={onClose} className={styles.closeButton} aria-label="Close badge details">
          Close
        </button>
      </div>
    </div>
  );
};

export default BadgeDetails;
