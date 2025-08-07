// src/services/pollService.ts
import type { AxiosResponse } from "axios"

import axios from "axios"

import { http } from "@/lib/http"

export interface Poll {
  id: string
  groupId: string
  question: string
  options: PollOption[]
  expirationDate: string
  status: string
  createdAt: string
  [key: string]: unknown
}

export interface PollOption {
  /** the human-readable option text */
  text: string
  /** the option’s unique id */
  id: string
  /** user IDs who have voted for this option */
  votes: string[]
}

interface ApiErrorResponse {
  message: string
}

// retry helper with exponential backoff
async function retry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 3,
): Promise<AxiosResponse<T>> {
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
      // client-side error or last attempt: surface the message if present
      if (
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.data?.message
      ) {
        throw new Error(err.response.data.message)
      }
      throw err
    }
  }
  throw new Error("Failed after multiple retries.")
}

const PollService = {
  /** GET /polls/groups/:groupId/polls */
  async getGroupPolls(groupId: string): Promise<Poll[]> {
    if (!groupId.trim()) {
      throw new Error("Group ID is required to fetch polls.")
    }
    const resp = await retry(() =>
      http.get<{ polls: Poll[] }>(
        `/polls/groups/${encodeURIComponent(groupId)}/polls`,
      ),
    )
    return resp.data.polls
  },

  /** POST /polls/groups/:groupId/polls */
  async createPoll(
    groupId: string,
    question: string,
    options: string[],
    expirationDate: string,
  ): Promise<Poll> {
    if (
      !groupId.trim() ||
      !question.trim() ||
      options.length < 2 ||
      !expirationDate
    ) {
      throw new Error(
        "Invalid poll data: groupId, question, ≥2 options, and expirationDate required.",
      )
    }
    const resp = await retry(() =>
      http.post<{ poll: Poll }>(
        `/polls/groups/${encodeURIComponent(groupId)}/polls`,
        {
          question,
          options,
          expirationDate,
        },
      ),
    )
    return resp.data.poll
  },

  /** POST /polls/polls/:pollId/vote */
  async votePoll(pollId: string, optionId: string): Promise<void> {
    if (!pollId.trim() || !optionId.trim()) {
      throw new Error("Poll ID and Option ID are required to vote.")
    }
    await retry(() =>
      http.post(`/polls/polls/${encodeURIComponent(pollId)}/vote`, {
        optionId,
      }),
    )
  },

  /** GET /polls/polls/:pollId/results */
  async getPollResults(
    pollId: string,
  ): Promise<{ option: string; votes: number }[]> {
    if (!pollId.trim()) {
      throw new Error("Poll ID is required to fetch results.")
    }
    const resp = await retry(() =>
      http.get<{ results: { option: string; votes: number }[] }>(
        `/polls/polls/${encodeURIComponent(pollId)}/results`,
      ),
    )
    return resp.data.results
  },
}

export default PollService
