// src/services/apiService.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';

/** Raw notification type from API */
export interface ApiNotification {
  id: string;
  message: string;
  read?: boolean;
}

/** Service for partner-related API calls */
const ApiService = {
  /**
   * Fetch partner notifications.
   * @returns Array of notifications with optional read flag.
   */
  async getPartnerNotifications(): Promise<ApiNotification[]> {
    const response = await axios.get<{ notifications: ApiNotification[] }>(
      `${API_BASE_URL}/partner/notifications`,
    );
    return response.data.notifications;
  },

  /**
   * Mark a notification as read.
   * @param id - Notification ID
   */
  async markNotificationAsRead(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/partner/notifications/${id}/read`);
  },

  /**
   * Delete a notification.
   * @param id - Notification ID
   */
  async deleteNotification(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/partner/notifications/${id}`);
  },
};

export default ApiService;
