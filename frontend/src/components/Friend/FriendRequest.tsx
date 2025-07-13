'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaUserCheck, FaUserTimes, FaBell } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import {
  fetchFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from '@/api/friends/friendApi';
import { FriendRequest, Friend } from '@/types/Friend.types';
import styles from './FriendRequest.module.css';

/**
 * FriendRequestComponent displays incoming friend requests with accept/decline controls.
 */
const FriendRequestComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  /** Fetch and map pending friend requests for current user */
  useEffect(() => {
    if (status !== 'authenticated' || !userId) return;
    const loadRequests = async (): Promise<void> => {
      setLoading(true);
      try {
        const requestsRaw = await fetchFriendRequests(userId);
        const mapped: FriendRequest[] = requestsRaw.map((r) => {
          const sender: Friend = {
            _id: r.sender.id,
            name: r.sender.name,
            email: r.sender.email ?? '',
            ...(r.sender.profilePicture && { profilePicture: r.sender.profilePicture }),
          };
          return { _id: r.id, sender };
        });
        setFriendRequests(mapped);
      } catch (err) {
        console.error('Error fetching friend requests:', err);
        setError('Failed to load friend requests.');
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [status, userId]);

  /** Accept a friend request for current user */
  const handleAccept = useCallback(
    async (id: string) => {
      if (!userId) return;
      setProcessingId(id);
      try {
        await acceptFriendRequest(userId, id);
        setFriendRequests((prev) => prev.filter((req) => req._id !== id));
      } catch (err) {
        console.error('Error accepting request:', err);
        setError('Failed to accept request.');
      } finally {
        setProcessingId(null);
      }
    },
    [userId],
  );

  /** Decline a friend request for current user */
  const handleDecline = useCallback(
    async (id: string) => {
      if (!userId) return;
      setProcessingId(id);
      try {
        await declineFriendRequest(userId, id);
        setFriendRequests((prev) => prev.filter((req) => req._id !== id));
      } catch (err) {
        console.error('Error declining request:', err);
        setError('Failed to decline request.');
      } finally {
        setProcessingId(null);
      }
    },
    [userId],
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Friend Requests</h2>
        {friendRequests.length > 0 && (
          <div className={styles.badgeWrapper}>
            <FaBell className={styles.bellIcon} />
            <span className={styles.badgeCount}>{friendRequests.length}</span>
          </div>
        )}
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : friendRequests.length > 0 ? (
        <ul className={styles.list}>
          {friendRequests.map((req) => (
            <motion.li
              key={req._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.listItem}
            >
              <div className={styles.profile}>
                <img
                  src={req.sender.profilePicture ?? '/default-avatar.png'}
                  alt={req.sender.name}
                  className={styles.avatar}
                />
                <span className={styles.name}>{req.sender.name}</span>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.acceptButton}
                  onClick={() => handleAccept(req._id)}
                  disabled={processingId === req._id}
                >
                  {processingId === req._id ? 'Processing...' : <FaUserCheck />}
                </button>
                <button
                  className={styles.declineButton}
                  onClick={() => handleDecline(req._id)}
                  disabled={processingId === req._id}
                >
                  {processingId === req._id ? 'Processing...' : <FaUserTimes />}
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No pending friend requests.</p>
      )}
    </div>
  );
};

export default FriendRequestComponent;
