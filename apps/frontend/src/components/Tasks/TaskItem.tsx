// src/components/Tasks/TaskItem.tsx
import React from "react"

import styles from "./TaskItem.module.css"

export interface Task {
  id: string
  title: string
  isCompleted: boolean
}

export interface TaskItemProps {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const { id, title, isCompleted } = task

  return (
    <li
      className={`
        ${styles.item}
        ${isCompleted ? styles.completed : ""}
      `}
      aria-label={`${title}${isCompleted ? " (completed)" : ""}`}
    >
      <div className={styles.details}>
        <input
          id={`checkbox-${id}`}
          type="checkbox"
          checked={isCompleted}
          onChange={() => onComplete(id)}
          className={styles.checkbox}
          aria-label={
            isCompleted
              ? `Mark "${title}" as incomplete`
              : `Mark "${title}" as complete`
          }
        />
        <label
          htmlFor={`checkbox-${id}`}
          className={`
            ${styles.title}
            ${isCompleted ? styles.strikethrough : ""}
          `}
        >
          {title}
        </label>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => onComplete(id)}
          className={`
            ${styles.completeButton}
            ${isCompleted ? styles.undoButton : ""}
          `}
          aria-label={
            isCompleted ? `Undo completion of ${title}` : `Complete ${title}`
          }
        >
          {isCompleted ? "Undo" : "Complete"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(id)}
          className={styles.deleteButton}
          aria-label={`Delete ${title}`}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export default TaskItem
