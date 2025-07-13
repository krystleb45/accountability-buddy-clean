// CollaborationUtils.ts

import { CollaborationGoal } from '@/types/Collaboration.types';

/**
 * Filters a list of collaboration goals by their status.
 *
 * @param goals - The array of collaboration goals to filter.
 * @param status - The status to filter by ("pending", "in-progress", "completed").
 * @returns A filtered array of collaboration goals matching the given status.
 */
export const filterGoalsByStatus = (
  goals: CollaborationGoal[],
  status: CollaborationGoal['status'],
): CollaborationGoal[] => goals.filter((goal) => goal.status === status);

/**
 * Sorts collaboration goals by their due date.
 *
 * @param goals - The array of collaboration goals to sort.
 * @param ascending - Whether to sort in ascending (earliest first) or descending (latest first) order.
 * @returns A sorted array of collaboration goals by due date.
 */
export const sortGoalsByDueDate = (
  goals: CollaborationGoal[],
  ascending = true,
): CollaborationGoal[] =>
  [...goals].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });

/**
 * Formats a date or ISO string to a readable string.
 *
 * @param input - The date to format (Date or ISO string).
 * @returns A formatted date string (e.g., "January 15, 2025").
 */
export const formatDate = (input: string | Date): string => {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return 'Invalid Date';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculates the overall progress of a list of collaboration goals.
 *
 * @param goals - The array of collaboration goals to calculate progress for.
 * @returns The average progress percentage across all goals (rounded to the nearest integer).
 */
export const calculateOverallProgress = (goals: CollaborationGoal[]): number => {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress ?? 0), 0);
  return Math.round(totalProgress / goals.length);
};

/**
 * Generates a summary of collaboration goals by status.
 *
 * @param goals - The array of collaboration goals to summarize.
 * @returns An object with counts of goals by their status.
 */
export const summarizeGoalsByStatus = (
  goals: CollaborationGoal[],
): Record<CollaborationGoal['status'], number> =>
  goals.reduce(
    (summary, goal) => {
      summary[goal.status]++;
      return summary;
    },
    { 'pending': 0, 'in-progress': 0, 'completed': 0 },
  );
