// src/components/Tasks/index.ts

// — Components
export { default as TaskItem } from './TaskItem';
export { default as TaskList } from './TaskList';
export { default as TaskManager } from './TaskManager';
export { default as TaskForm } from './TaskForm';
export { default as TaskFilters } from './TaskFilters';

// — Hooks
export * from '@/hooks/features/useTasks';

// — Helpers (under their own namespace to avoid type collisions)
export * as TaskHelpers from 'src/utils/taskHelpers';

// — Types (Task, TaskFilters, etc.)
export * from '../../types/Tasks.types';
