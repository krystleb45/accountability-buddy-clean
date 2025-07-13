'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './BadgeDetailModal.module.css';

export interface BadgeDetail {
  _id: string;
  badgeType: string;
  description?: string;
  level: 'Bronze' | 'Silver' | 'Gold';
  progress: number;
  goal: number;
  icon?: string;
  dateAwarded?: string;
}

interface BadgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeDetail;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ isOpen, onClose, badge }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-modal-title"
          onClick={(e) => e.currentTarget === e.target && onClose()}
        >
          <motion.div
            className={styles.dialog}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.3 }}
            tabIndex={-1}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close badge details"
            >
              <X size={20} />
            </button>

            <div className={styles.content}>
              <img
                src={badge.icon ?? '/placeholder-badge.png'}
                alt=""
                aria-hidden={!!badge.icon}
                className={styles.icon}
              />
              <h2 id="badge-modal-title" className={styles.title}>
                {badge.badgeType.replace(/_/g, ' ')}
              </h2>

              <p
                className={[
                  styles.level,
                  badge.level === 'Gold'
                    ? styles.gold
                    : badge.level === 'Silver'
                      ? styles.silver
                      : styles.bronze,
                ].join(' ')}
              >
                {badge.level} Level
              </p>

              {badge.description && <p className={styles.description}>{badge.description}</p>}

              <div className={styles.progressSection}>
                <div className={styles.progressText}>
                  Progress: {badge.progress} / {badge.goal}
                </div>
                <div className={styles.progressBarBackground}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${Math.min(100, (badge.progress / badge.goal) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {badge.dateAwarded && (
                <p className={styles.dateAwarded}>
                  Awarded on{' '}
                  {new Date(badge.dateAwarded).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeDetailModal;
