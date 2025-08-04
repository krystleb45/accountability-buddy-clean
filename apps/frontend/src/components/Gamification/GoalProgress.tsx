import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Typography,
} from "@mui/material"
import React from "react"

// Define the interface for the goal progress
interface GoalProgressProps {
  goalTitle: string
  currentProgress: number
  targetProgress: number
  onEditGoal: () => void
  progress?: number // Add a progress prop with an optional value
  description?: string // Add a description prop with an optional value
}

const GoalProgress: React.FC<GoalProgressProps> = ({
  goalTitle,
  currentProgress,
  targetProgress,
  onEditGoal,
}) => {
  // Calculate the percentage completion safely
  const progressPercentage =
    targetProgress > 0
      ? Math.min((currentProgress / targetProgress) * 100, 100)
      : 0 // Prevent values over 100%

  return (
    <Card data-testid="goal-progress-card">
      <CardHeader
        title={goalTitle}
        titleTypographyProps={{ variant: "h6" }}
        data-testid="goal-title"
      />
      <CardContent>
        {/* Progress information */}
        <Box mb={2}>
          <Typography
            variant="body2"
            color="textSecondary"
            data-testid="progress-info"
          >
            Progress: {currentProgress}/{targetProgress}
          </Typography>
          {/* Accessible progress bar */}
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            data-testid="progress-bar"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ height: "10px", borderRadius: "5px" }}
          />
        </Box>
        {/* Percentage completion */}
        <Typography
          variant="caption"
          color="textSecondary"
          data-testid="progress-percentage"
        >
          {progressPercentage.toFixed(0)}% completed
        </Typography>
        {/* Edit goal button */}
        <Button
          variant="contained"
          color="primary"
          onClick={onEditGoal}
          data-testid="edit-goal-button"
          style={{ marginTop: "16px" }}
        >
          Edit Goal
        </Button>
      </CardContent>
    </Card>
  )
}

export default GoalProgress
