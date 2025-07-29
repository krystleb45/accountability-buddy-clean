// src/goal-messages/goalMessageApi.ts

import axios from 'axios';
import { http } from '@/utils/http';

export interface GoalMessage {
  _id: string;
  goalId: string;
  userId: string;
  message: string;
  createdAt: string;
}

/**
 * Send a message for a specific goal.
 * POST /goal-message/:goalId/send
 */
export async function sendGoalMessage(goalId: string, message: string): Promise<boolean> {
  if (!goalId || !message.trim()) {
    console.error('[goalMessageApi::sendGoalMessage] goalId and message are required');
    return false;
  }
  try {
    await http.post(`/goal-message/${encodeURIComponent(goalId)}/send`, { message });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[goalMessageApi::sendGoalMessage]', error.response?.data || error.message);
    } else {
      console.error('[goalMessageApi::sendGoalMessage]', error);
    }
    return false;
  }
}

/**
 * Fetch all messages for a specific goal.
 * GET /goal-message/:goalId/messages
 */
export async function fetchGoalMessages(goalId: string): Promise<GoalMessage[]> {
  if (!goalId) {
    console.error('[goalMessageApi::fetchGoalMessages] goalId is required');
    return [];
  }
  try {
    const resp = await http.get<GoalMessage[]>(
      `/goal-message/${encodeURIComponent(goalId)}/messages`
    );
    return resp.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[goalMessageApi::fetchGoalMessages]', error.response?.data || error.message);
    } else {
      console.error('[goalMessageApi::fetchGoalMessages]', error);
    }
    return [];
  }
}

export default {
  sendGoalMessage,
  fetchGoalMessages,
};
