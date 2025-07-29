'use client';

import React, { useEffect, useState, KeyboardEvent } from 'react';
import badgeService from '@/services/badgeService';
import styles from './FavoriteBadges.module.css';

interface Badge {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

const getStoredUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.id ?? parsed._id ?? null;
  } catch {
    return null;
  }
};

const FavoriteBadges: React.FC = () => {
  const [favoriteBadges, setFavoriteBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // …
  useEffect(() => {
    const init = async (): Promise<void> => {
      const uid = getStoredUserId();
      setUserId(uid);

      if (!uid) {
        console.warn('⚠️ No user ID found in localStorage.');
        setLoading(false);
        return;
      }

      try {
        // No args here—your badgeService already reads user ID under the hood
        const badges = await badgeService.fetchFavoriteBadges();
        setFavoriteBadges(badges);
      } catch (err) {
        console.error('❌ Failed to fetch favorite badges:', err);
        setError('Failed to load favorite badges.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);
  // …

  const handleToggle = async (badgeId: string): Promise<void> => {
    if (!userId) return;
    try {
      const updated = await badgeService.toggleFavoriteBadge(userId, badgeId);
      setFavoriteBadges(updated);
    } catch (err) {
      console.error('❌ Failed to toggle favorite badge:', err);
      setError('Failed to update favorites.');
    }
  };

  const onKeyDown =
    (badgeId: string) =>
    (e: KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle(badgeId);
      }
    };

  if (loading) {
    return <p className={styles.statusText}>Loading favorite badges…</p>;
  }
  if (error) {
    return <p className={styles.statusText}>{error}</p>;
  }
  if (favoriteBadges.length === 0) {
    return <p className={styles.statusText}>No favorite badges selected yet.</p>;
  }

  return (
    <div className={styles.badgesGrid}>
      {favoriteBadges.map((badge) => (
        <div
          key={badge.id}
          role="button"
          aria-pressed="true"
          tabIndex={0}
          className={`${styles.badgeCard} transition hover:bg-gray-800 hover:shadow-md`}
          onClick={() => handleToggle(badge.id)}
          onKeyDown={onKeyDown(badge.id)}
        >
          <img
            src={badge.icon ?? 'https://via.placeholder.com/60'}
            alt={badge.name}
            className={styles.badgeIcon}
          />
          <h4 className={styles.badgeName}>{badge.name}</h4>
          {badge.description && <p className={styles.badgeDescription}>{badge.description}</p>}
          <p className={styles.favoriteHint}>⭐ Click to toggle favorite</p>
        </div>
      ))}
    </div>
  );
};

export default FavoriteBadges;
