// src/components/Tasks/TaskList.tsx
import React from "react"

import type { Task } from "./TaskItem"

import TaskItem from "./TaskItem"
import styles from "./TaskList.module.css"

export interface TaskListProps {
  tasks: Task[]
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onDelete }) => {
  if (tasks.length === 0) {
    return (
      <p className={styles.empty} role="alert">
        No tasks available. Start by creating one!
      </p>
    )
  }

  return (
    <section className={styles.container} aria-labelledby="task-list-heading">
      <h3 id="task-list-heading" className={styles.heading}>
        Your Tasks
      </h3>
      <ul className={styles.list}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  )
}

export default TaskList
