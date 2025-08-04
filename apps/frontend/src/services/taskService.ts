// src/services/taskService.ts

import axios from "axios"

import { getAuthHeader } from "@/services/authService"
import { http } from "@/utils/http"

interface ApiErrorResponse {
  message: string
}

// exponential‐backoff retry helper
async function axiosRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isServerError =
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500
      if (isServerError && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
        attempt++
        continue
      }
      throw err
    }
  }
  throw new Error("Failed after multiple retries.")
}

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

export interface TaskInput {
  title: string
  description?: string
  dueDate?: string
  status?: "pending" | "in-progress" | "completed"
  priority?: "low" | "medium" | "high"
}

const TaskService = {
  /** POST /tasks */
  async createTask(data: TaskInput): Promise<Task> {
    const headers = getAuthHeader()
    const resp = await axiosRetry(() =>
      http.post<Task>("/tasks", data, { headers }),
    )
    return resp.data
  },

  /** GET /tasks */
  async getUserTasks(): Promise<Task[]> {
    const headers = getAuthHeader()
    const resp = await axiosRetry(() => http.get<Task[]>("/tasks", { headers }))
    return resp.data
  },

  /** GET /tasks/:id */
  async getTaskById(taskId: string): Promise<Task> {
    if (!taskId.trim()) throw new Error("Task ID is required")
    const headers = getAuthHeader()
    const resp = await axiosRetry(() =>
      http.get<Task>(`/tasks/${encodeURIComponent(taskId)}`, { headers }),
    )
    return resp.data
  },

  /** PUT /tasks/:id */
  async updateTask(taskId: string, updates: Partial<TaskInput>): Promise<Task> {
    if (!taskId.trim()) throw new Error("Task ID is required")
    const headers = getAuthHeader()
    const resp = await axiosRetry(() =>
      http.put<Task>(`/tasks/${encodeURIComponent(taskId)}`, updates, {
        headers,
      }),
    )
    return resp.data
  },

  /** DELETE /tasks/:id */
  async deleteTask(taskId: string): Promise<void> {
    if (!taskId.trim()) throw new Error("Task ID is required")
    const headers = getAuthHeader()
    await axiosRetry(() =>
      http.delete(`/tasks/${encodeURIComponent(taskId)}`, { headers }),
    )
  },
}

export default TaskService
