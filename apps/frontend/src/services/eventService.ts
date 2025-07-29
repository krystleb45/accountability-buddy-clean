// src/services/eventService.ts
import axios from 'axios';
import { http } from '@/utils/http';

// ---------------------------
// Types
// ---------------------------
export interface Event {
  id: string;
  eventTitle: string;
  description: string;
  date: string; // ISO date-time
  participants: string[];
  location: string;
  createdBy: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ---------------------------
// Error Handler
// ---------------------------
const handleError = <T>(fn: string, error: unknown, fallback: T): T => {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [eventService::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [eventService::${fn}]`, error);
  }
  return fallback;
};

// ---------------------------
// Service Methods
// ---------------------------
const EventService = {
  /** POST /events/create */
  async createEvent(payload: {
    eventTitle: string;
    description: string;
    date: string;
    participants: string[];
    location: string;
  }): Promise<ApiResponse<Event>> {
    try {
      const resp = await http.post<Event>('/events/create', payload);
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('createEvent', err, {
        success: false,
        message: 'Failed to create event.',
      });
    }
  },

  /** GET /events/my-events */
  async getMyEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const resp = await http.get<Event[]>('/events/my-events');
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('getMyEvents', err, {
        success: false,
        data: [],
        message: 'Failed to load your events.',
      });
    }
  },

  /** GET /events */
  async getAllEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const resp = await http.get<Event[]>('/events');
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('getAllEvents', err, {
        success: false,
        data: [],
        message: 'Failed to load events.',
      });
    }
  },

  /** POST /events/:id/join */
  async joinEvent(eventId: string): Promise<ApiResponse<Event>> {
    try {
      const resp = await http.post<Event>(`/events/${eventId}/join`);
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('joinEvent', err, {
        success: false,
        message: 'Failed to join event.',
      });
    }
  },

  /** POST /events/:id/leave */
  async leaveEvent(eventId: string): Promise<ApiResponse<Event>> {
    try {
      const resp = await http.post<Event>(`/events/${eventId}/leave`);
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('leaveEvent', err, {
        success: false,
        message: 'Failed to leave event.',
      });
    }
  },

  /** GET /events/:id */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    try {
      const resp = await http.get<Event>(`/events/${id}`);
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('getEventById', err, {
        success: false,
        message: 'Failed to load event.',
      });
    }
  },

  /** PUT /events/:id/update-progress */
  async updateProgress(id: string, progress: number): Promise<ApiResponse<Event>> {
    try {
      const resp = await http.put<Event>(`/events/${id}/update-progress`, { progress });
      return { success: true, data: resp.data };
    } catch (err) {
      return handleError('updateProgress', err, {
        success: false,
        message: 'Failed to update progress.',
      });
    }
  },

  /** DELETE /events/:id */
  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    try {
      await http.delete(`/events/${id}`);
      return { success: true };
    } catch (err) {
      return handleError('deleteEvent', err, {
        success: false,
        message: 'Failed to delete event.',
      });
    }
  },
};

export default EventService;
