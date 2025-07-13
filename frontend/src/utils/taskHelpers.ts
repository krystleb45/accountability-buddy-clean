// src/utils/taskHelpers.ts

/**
 * A single task.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
}

/**
 * Criteria by which tasks can be filtered.
 */
export interface TaskFilters {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDateBefore?: string; // ISO date string
  dueDateAfter?: string; // ISO date string
}

/**
 * Returns only those tasks matching every defined filter field.
 *
 * @param tasks - The list of tasks to filter.
 * @param filters - The criteria to apply.
 * @returns A new array containing only matching tasks.
 */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.completed !== undefined && task.completed !== filters.completed) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    if (filters.dueDateBefore && task.dueDate && task.dueDate >= filters.dueDateBefore) {
      return false;
    }
    if (filters.dueDateAfter && task.dueDate && task.dueDate <= filters.dueDateAfter) {
      return false;
    }
    return true;
  });
}

/**
 * Sorts a copy of the task array according to the given key.
 *
 * @param tasks - The list of tasks to sort.
 * @param key - A key on Task to sort by.
 * @param ascending - If true, ascending order; descending otherwise.
 * @returns A new, sorted array of tasks.
 */
export function sortTasks(tasks: Task[], key: keyof Task, ascending: boolean = true): Task[] {
  return [...tasks].sort((a, b) => {
    // handle undefined fields
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    if (av < bv) return ascending ? -1 : 1;
    if (av > bv) return ascending ? 1 : -1;
    return 0;
  });
}

/**
 * Returns a new Task marked as completed.
 */
export function completeTask(task: Task): Task {
  return { ...task, completed: true };
}

/**
 * Returns a new Task marked as not completed.
 */
export function uncompleteTask(task: Task): Task {
  return { ...task, completed: false };
}

/**
 * Toggles the completed flag on a Task.
 */
export function toggleTaskCompletion(task: Task): Task {
  return { ...task, completed: !task.completed };
}

/**
 * Finds a task by its `id`.
 *
 * @returns The matching Task or undefined if not found.
 */
export function findTaskById(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

/**
 * Returns a new array without the task whose `id` matches.
 */
export function removeTaskById(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

/**
 * Returns a new array where the task of the given `id`
 * is shallow‐merged with `updatedFields`.
 */
export function updateTaskById(tasks: Task[], id: string, updatedFields: Partial<Task>): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, ...updatedFields } : task));
}

/**
 * Creates a brand-new Task with a unique ID and timestamp.
 *
 * @param title - The task’s title.
 * @param description - Optional longer description.
 * @param priority - One of 'low' | 'medium' | 'high'.
 * @param dueDate - Optional due date (ISO string).
 * @returns A freshly constructed Task.
 */
export function createTask(
  title: string,
  description: string = '',
  priority: 'low' | 'medium' | 'high' = 'medium',
  dueDate?: string,
): Task {
  const base: Omit<Task, 'dueDate'> = {
    id: crypto.randomUUID(),
    title,
    description,
    completed: false,
    priority,
    createdAt: new Date().toISOString(),
  };

  // Only spread in dueDate if it’s actually provided:
  return dueDate !== undefined ? { ...base, dueDate } : base;
}

/**
 * Tallies how many tasks are completed vs pending.
 *
 * @returns An object with `completed` and `pending` counts.
 */
export function countTaskStatus(tasks: Task[]): { completed: number; pending: number } {
  return tasks.reduce(
    (acc, task) => {
      if (task.completed) {
        acc.completed += 1;
      } else {
        acc.pending += 1;
      }
      return acc;
    },
    { completed: 0, pending: 0 },
  );
}

export default {
  filterTasks,
  sortTasks,
  completeTask,
  uncompleteTask,
  toggleTaskCompletion,
  findTaskById,
  removeTaskById,
  updateTaskById,
  createTask,
  countTaskStatus,
};
