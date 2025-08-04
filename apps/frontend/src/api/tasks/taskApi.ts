// src/tasks/taskApi.ts

import axios from "axios"

import { http } from "@/utils/http"

// ---------------------
// Type Definitions
// ---------------------

/** A single task returned by the backend */
export interface Task {
  _id: string
  userId: string
  title: string
  description?: string
  dueDate?: string
  status: "pending" | "in-progress" | "completed"
  priority?: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

/** Payload when creating or updating a task */
export interface TaskInput {
  title: string
  description?: string
  dueDate?: string
  status?: "pending" | "in-progress" | "completed"
  priority?: "low" | "medium" | "high"
}

/** Standard error shape from the API */
interface ApiErrorResponse {
  message: string
}

// ---------------------
// Helpers
// ---------------------

/** Type guard for Axios errors */
function isAxiosError(
  error: unknown,
): error is { response?: { data: ApiErrorResponse } } {
  return axios.isAxiosError(error) && Boolean(error.response?.data)
}

/** Throw the server’s error message if present, or a generic one */
function handleError(error: unknown): never {
  if (isAxiosError(error) && error.response?.data.message) {
    throw new Error(error.response.data.message)
  }
  throw new Error("An unexpected error occurred.")
}

// ---------------------
// API Methods
// ---------------------

/** Create a new task */
export async function createTask(data: TaskInput): Promise<Task> {
  try {
    const response = await http.post<Task>("/tasks", data)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/** Fetch all tasks for the current user */
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await http.get<Task[]>("/tasks")
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/** Fetch a single task by its ID */
export async function fetchTaskById(taskId: string): Promise<Task> {
  if (!taskId.trim()) throw new Error("Task ID is required.")
  try {
    const response = await http.get<Task>(
      `/tasks/${encodeURIComponent(taskId)}`,
    )
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/** Update an existing task */
export async function updateTask(
  taskId: string,
  updates: Partial<TaskInput>,
): Promise<Task> {
  if (!taskId.trim()) throw new Error("Task ID is required.")
  try {
    const response = await http.put<Task>(
      `/tasks/${encodeURIComponent(taskId)}`,
      updates,
    )
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/** Delete a task */
export async function deleteTask(taskId: string): Promise<{ message: string }> {
  if (!taskId.trim()) throw new Error("Task ID is required.")
  try {
    const response = await http.delete<{ message: string }>(
      `/tasks/${encodeURIComponent(taskId)}`,
    )
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export default {
  createTask,
  fetchTasks,
  fetchTaskById,
  updateTask,
  deleteTask,
}
