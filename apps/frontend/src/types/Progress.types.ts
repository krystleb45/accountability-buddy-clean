// src/types/Progress.types.ts

/**
 * Core Goal shape used throughout the Goals UI.
 */
export interface Goal {
  id: string
  title: string
  description?: string
  status: string
  progress: number // 0–100
}

/**
 * Data passed to Chart.js (or react-chartjs-2) for analytics.
 */
export interface AnalyticsData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

/**
 * Props for the GoalAnalytics component if you ever
 * choose to render it from another parent.
 */
export interface GoalAnalyticsProps {
  /** Which date range filter to fetch */
  dateRange: "all" | "lastMonth" | "lastWeek"
  /** Whether to render a line or bar chart */
  chartType?: "line" | "bar"
}

/**
 * Values emitted by CreateGoalForm on submit.
 */
export interface CreateGoalFormValues {
  title: string
  description?: string
  dueDate?: string
  category?: string
}

/**
 * Props for the “Create a Goal” form.
 */
export interface CreateGoalFormProps {
  onSubmit: (data: CreateGoalFormValues) => void
  defaultValues?: Partial<CreateGoalFormValues>
}

/**
 * Props for the little progress-bar widget.
 */
export interface ProgressTrackerProps {
  progress: number // 0–100
  label?: string // optional aria-label / heading
}

/**
 * Props for the GoalDetails pane.
 */
export interface GoalDetailsProps {
  goal: Goal | null
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onUpdateProgress: (id: string, newProgress: number) => void
}
