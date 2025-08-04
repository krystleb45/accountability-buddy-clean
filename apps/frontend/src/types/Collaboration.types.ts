/**
 * Represents a goal in the collaboration system.
 */
export interface CollaborationGoal {
  progress: number // Progress percentage
  id: string // Unique identifier for the goal
  title: string // Title of the goal
  description: string // Description of the goal
  assignedUsers: CollaborationUser[] // List of users assigned to the goal
  dueDate: string | Date // Due date for the goal (ISO string or Date)
  status: "pending" | "in-progress" | "completed" // Current status of the goal
}

/**
 * Represents a user in the collaboration system.
 */
export interface CollaborationUser {
  id: string // Unique identifier for the user
  name: string // Display name of the user
  avatarUrl?: string // Optional URL for the user's avatar
  email: string // Email address of the user
}

/**
 * Props for the CollaborationGoalList component.
 */
export interface CollaborationGoalListProps {
  goals?: CollaborationGoal[] // Optional list of collaboration goals
  onGoalClick?: (goalId: string) => void // Optional click handler for a goal
}

/**
 * Represents a collaboration action (e.g., comment or update).
 */
export interface CollaborationAction {
  id: string // Unique identifier for the action
  goalId: string // ID of the associated goal
  userId: string // ID of the user performing the action
  actionType: "comment" | "update" | "status-change" // Type of action performed
  timestamp: Date // Timestamp of the action
  details: string // Details of the action
}

/**
 * Utility types for filtering goals.
 */
export type GoalStatusFilter = "all" | "pending" | "in-progress" | "completed"

/**
 * Props for a reusable GoalCard component.
 */
export interface GoalCardProps {
  goal: CollaborationGoal // Goal data to display
  onClick?: () => void // Optional click handler for the card
}
