// src/hooks/features/useTasks.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { http } from '@/utils/http';
import { API } from '@/constants/apiEndpoints';
import type { Task, TaskFilters } from '@/types/Tasks.types';

export interface UseTasksReturn {
  tasks: Task[];
  filteredTasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (newTask: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (updated: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  applyFilters: (newFilters: TaskFilters) => void;
  clearError: () => void;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Load all tasks from server */
  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await http.get<Task[]>(API.TASKS.LIST);
      setTasks(data);
    } catch (err: unknown) {
      setError('Failed to load tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Create a new task */
  const addTask = useCallback(async (newTask: Omit<Task, 'id'>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data: created } = await http.post<Task>(API.TASKS.CREATE, newTask);
      setTasks((prev) => [...prev, created]);
    } catch (err) {
      setError('Failed to add task.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Update an existing task */
  const updateTask = useCallback(async (updated: Task): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = API.TASKS.UPDATE.replace(':taskId', updated.id);
      const { data } = await http.put<Task>(endpoint, updated);
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } catch (err) {
      setError('Failed to update task.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Delete a task */
  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = API.TASKS.DELETE.replace(':taskId', taskId);
      await http.delete(endpoint);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Toggle completion status */
  const toggleTaskCompletion = useCallback(
    async (taskId: string): Promise<void> => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      await updateTask({ ...task, isCompleted: !task.isCompleted });
    },
    [tasks, updateTask],
  );

  /** Apply new filter set */
  const applyFilters = useCallback((newFilters: TaskFilters): void => {
    setFilters(newFilters);
  }, []);

  /** Clear any error message */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /** memoize filteredTasks */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status) {
        const status = task.isCompleted ? 'completed' : 'pending';
        if (filters.status !== status) return false;
      }
      if (filters.priority && filters.priority !== task.priority) {
        return false;
      }
      if (
        filters.searchTerm &&
        !task.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);

  /** load tasks on mount */
  useEffect(() => {
    fetchTasks().catch(() => {});
  }, [fetchTasks]);

  return {
    tasks,
    filteredTasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    applyFilters,
    clearError,
  };
};
