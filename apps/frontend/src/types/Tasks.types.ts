// Represents a single task
export interface Task {
  id: string // Unique identifier for the task
  title: string // Title of the task
  description?: string // Optional description
  dueDate?: string // Optional ISO date
  priority?: "low" | "medium" | "high"
  isCompleted: boolean // Completion flag
}

// Props for TaskItem
export interface TaskItemProps {
  task: Task
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
}

// Props for TaskList
export interface TaskListProps {
  tasks: Task[]
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
}

// Props for TaskForm
export interface TaskFormProps {
  onSubmit: (task: Task) => void
  initialValues?: Task
  onCancel?: () => void
}

// Props for TaskFilters
export interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilters) => void
}

// The filters shape
export interface TaskFilters {
  status?: "completed" | "pending" | "in_progress"
  priority?: "low" | "medium" | "high"
  searchTerm?: string
}

// State for TaskManager (if you need it)
export interface TaskManagerState {
  tasks: Task[]
  filters: TaskFilters
  newTaskInput: string
}
