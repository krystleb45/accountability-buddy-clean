// src/components/Tasks/TaskManager.tsx
import React, { useState, ChangeEvent } from 'react';
import { Task } from './TaskItem';
import TaskList from './TaskList';
import styles from './TaskManager.module.css';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewTaskTitle(e.target.value);
  };

  const addTask = (): void => {
    const title = newTaskTitle.trim();
    if (!title) return;

    setTasks((prev) => [...prev, { id: Date.now().toString(), title, isCompleted: false }]);
    setNewTaskTitle('');
  };

  const toggleTaskCompletion = (id: string): void => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)));
  };

  const deleteTask = (id: string): void => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompletedTasks = (): void => {
    setTasks((prev) => prev.filter((t) => !t.isCompleted));
  };

  return (
    <section className={styles.container} aria-labelledby="task-manager-heading">
      <h2 id="task-manager-heading" className={styles.title}>
        Task Manager
      </h2>

      <div className={styles.inputGroup}>
        <label htmlFor="new-task" className="sr-only">
          New task
        </label>
        <input
          id="new-task"
          type="text"
          value={newTaskTitle}
          onChange={handleInputChange}
          placeholder="Add a new task…"
          className={styles.input}
          aria-label="New task title"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={!newTaskTitle.trim()}
          className={styles.addButton}
        >
          Add
        </button>
      </div>

      <TaskList tasks={tasks} onComplete={toggleTaskCompletion} onDelete={deleteTask} />

      {tasks.some((t) => t.isCompleted) && (
        <button type="button" onClick={clearCompletedTasks} className={styles.clearButton}>
          Clear Completed
        </button>
      )}
    </section>
  );
};

export default TaskManager;
