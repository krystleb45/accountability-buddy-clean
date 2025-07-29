// src/components/Notifications/PartnerNotifications.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ApiService from '../../services/apiService';
import styles from './PartnerNotifications.module.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface RawNotification {
  id: string;
  message: string;
  read?: boolean;
}

export interface PartnerNotification {
  id: string;
  message: string;
  isRead: boolean;
}

const PartnerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect((): void => {
    const fetchNotifications = async (): Promise<void> => {
      setLoading(true);
      setError('');

      try {
        const apiNotifications: RawNotification[] = await ApiService.getPartnerNotifications();

        setNotifications(
          apiNotifications.map((n) => ({
            id: n.id,
            message: n.message,
            isRead: n.read ?? false,
          })),
        );
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void fetchNotifications();
  }, []);

  const markAsRead = async (id: string): Promise<void> => {
    try {
      await ApiService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (id: string): Promise<void> => {
    try {
      await ApiService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.spinnerWrapper}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <section className={styles.container} aria-labelledby="partner-notifs-heading">
      <h2 id="partner-notifs-heading" className={styles.heading}>
        Partner Notifications
      </h2>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : notifications.length === 0 ? (
        <p className={styles.empty}>No notifications available.</p>
      ) : (
        <ul className={styles.list}>
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`${styles.item} ${notif.isRead ? styles.read : styles.unread}`}
            >
              <p className={styles.message}>{notif.message}</p>
              <div className={styles.actions}>
                {!notif.isRead && (
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={(): void => void markAsRead(notif.id)}
                    aria-label="Mark notification as read"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={(): void => void deleteNotification(notif.id)}
                  aria-label="Delete notification"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PartnerNotifications;
