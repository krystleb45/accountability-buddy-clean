// src/components/Tasks/TaskFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from './TaskFilters.module.css';

export interface TaskFilterValues {
  status?: string;
  priority?: string;
  searchTerm?: string;
}

export interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilterValues) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ onFilterChange }) => {
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Whenever any filter value changes, notify the parent
  useEffect(() => {
    onFilterChange({ status, priority, searchTerm });
  }, [status, priority, searchTerm, onFilterChange]);

  const resetFilters = (): void => {
    setStatus('');
    setPriority('');
    setSearchTerm('');
  };

  return (
    <div className={styles.taskFilters}>
      <h3 className={styles.heading}>Filter Tasks</h3>

      <div className={styles.filterGroup}>
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.select}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="priority">Priority:</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={styles.select}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="searchTerm">Search:</label>
        <input
          id="searchTerm"
          type="text"
          value={searchTerm}
          placeholder="Search by task name…"
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />
      </div>

      <button type="button" className={styles.resetButton} onClick={resetFilters}>
        Reset Filters
      </button>
    </div>
  );
};

export default TaskFilters;
