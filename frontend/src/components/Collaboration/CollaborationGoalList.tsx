'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getUserCollaborationGoals,
  updateCollaborationGoalProgress,
} from '@/api/collaboration/collaborationGoalApi';
import {
  CollaborationGoal,
  CollaborationGoalListProps,
  CollaborationUser,
} from '@/types/Collaboration.types';
import styles from './CollaborationGoalList.module.css';

// Raw API response type
interface RawCollabGoal {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  participants: string[];
  dueDate?: string;
  progress?: number;
}

/**
 * Displays a paginated list of collaboration goals,
 * allowing progress updates and detail navigation.
 */
const CollaborationGoalList: React.FC<CollaborationGoalListProps> = ({
  goals: initialGoals = [],
  onGoalClick,
}) => {
  const [goals, setGoals] = useState<CollaborationGoal[]>(initialGoals);
  const [loading, setLoading] = useState<boolean>(initialGoals.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Map RawCollabGoal to CollaborationGoal
  const mapToCollabGoal = (raw: RawCollabGoal): CollaborationGoal => ({
    id: raw.id,
    title: raw.title,
    description: raw.description,
    progress: raw.progress ?? 0,
    dueDate: raw.dueDate ?? new Date().toISOString(),
    status: 'pending',
    assignedUsers: raw.participants.map(
      (uid) => ({ id: uid, name: uid, email: '' }) as CollaborationUser,
    ),
  });

  // Fetch goals from API when no initialGoals or on page change
  const fetchGoals = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const { goals: fetchedGoals, totalPages: tp } = await getUserCollaborationGoals(pageNum);
      const formatted = (fetchedGoals as RawCollabGoal[]).map(mapToCollabGoal);
      setGoals(formatted);
      setTotalPages(tp);
    } catch (e) {
      console.error('Error fetching goals:', e);
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialGoals.length === 0) fetchGoals(page);
  }, [initialGoals.length, fetchGoals, page]);

  // Update goal progress
  const handleProgressUpdate = useCallback(async (goalId: string, newProgress: number) => {
    try {
      await updateCollaborationGoalProgress(goalId, newProgress);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, progress: newProgress } : g)));
    } catch (e) {
      console.error('Error updating progress:', e);
      setError('Could not update progress. Please try again.');
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <section className={styles['goal-list-container']} aria-labelledby="collab-goals-heading">
      <h2 id="collab-goals-heading">Collaboration Goals</h2>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && goals.length === 0 && <p>No goals to display.</p>}

      {!loading && !error && goals.length > 0 && (
        <ul className={styles['goal-list']}>
          {goals.map((goal) => (
            <li key={goal.id} className={styles['goal-card']}>
              <button
                type="button"
                onClick={() => onGoalClick?.(goal.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onGoalClick?.(goal.id);
                }}
                className={styles['goal-content']}
                aria-label={`View details for ${goal.title}`}
              >
                <h3 className={styles['goal-title']}>{goal.title}</h3>
                <p className={styles['goal-description']}>Progress: {goal.progress}%</p>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgressUpdate(goal.id, Math.min(goal.progress + 10, 100));
                }}
                className={styles['progress-button']}
                aria-label={`Increase progress for ${goal.title}`}
              >
                Increase Progress
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              disabled={page === i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={
                page === i + 1 ? styles['pagination-button-active'] : styles['pagination-button']
              }
              aria-current={page === i + 1 ? 'page' : undefined}
              aria-label={`Go to page ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
};

export default CollaborationGoalList;
