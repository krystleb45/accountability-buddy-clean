// src/events/eventApi.ts

import axios from "axios"

import { http } from "@/utils/http"

/**
 * Mirror of the Event type
 */
export interface Event {
  id: string
  eventTitle: string
  description: string
  date: string
  participants: string[]
  location: string
  createdBy: string
  progress?: number
  createdAt: string
  updatedAt: string
}

// ---------------------
// API Functions
// ---------------------

/** Create a new event */
export async function createEvent(payload: {
  eventTitle: string
  description: string
  date: string
  participants: string[]
  location: string
}): Promise<Event | null> {
  try {
    const resp = await http.post<Event>("/events/create", payload)
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [eventApi::createEvent]",
        error.response?.data || error.message,
      )
    } else {
      console.error("❌ [eventApi::createEvent]", error)
    }
    return null
  }
}

/** Fetch the current user’s events */
export async function fetchMyEvents(): Promise<Event[]> {
  try {
    const resp = await http.get<Event[]>("/events/my-events")
    return resp.data
  } catch (error) {
    console.error("❌ [eventApi::fetchMyEvents]", error)
    return []
  }
}

/** Fetch all events */
export async function fetchAllEvents(): Promise<Event[]> {
  try {
    const resp = await http.get<Event[]>("/events")
    return resp.data
  } catch (error) {
    console.error("❌ [eventApi::fetchAllEvents]", error)
    return []
  }
}

/** Join an event */
export async function joinEvent(eventId: string): Promise<Event | null> {
  if (!eventId) {
    console.error("❌ [eventApi::joinEvent] eventId is required")
    return null
  }
  try {
    const resp = await http.post<Event>(
      `/events/${encodeURIComponent(eventId)}/join`,
    )
    return resp.data
  } catch (error) {
    console.error("❌ [eventApi::joinEvent]", error)
    return null
  }
}

/** Leave an event */
export async function leaveEvent(eventId: string): Promise<Event | null> {
  if (!eventId) {
    console.error("❌ [eventApi::leaveEvent] eventId is required")
    return null
  }
  try {
    const resp = await http.post<Event>(
      `/events/${encodeURIComponent(eventId)}/leave`,
    )
    return resp.data
  } catch (error) {
    console.error("❌ [eventApi::leaveEvent]", error)
    return null
  }
}

/** Fetch a single event */
export async function fetchEventById(eventId: string): Promise<Event | null> {
  if (!eventId) {
    console.error("❌ [eventApi::fetchEventById] eventId is required")
    return null
  }
  try {
    const resp = await http.get<Event>(`/events/${encodeURIComponent(eventId)}`)
    return resp.data
  } catch (error) {
    console.error("❌ [eventApi::fetchEventById]", error)
    return null
  }
}

/** Update event progress */
export async function updateEventProgress(
  eventId: string,
  progress: number,
): Promise<Event | null> {
  if (!eventId) {
    console.error("❌ [eventApi::updateEventProgress] eventId is required")
    return null
  }
  try {
    const resp = await http.put<Event>(
      `/events/${encodeURIComponent(eventId)}/update-progress`,
      { progress },
    )
    return resp.data
  } catch (error) {
    console.error("❌ [eventApi::updateEventProgress]", error)
    return null
  }
}

/** Delete an event */
export async function deleteEvent(eventId: string): Promise<boolean> {
  if (!eventId) {
    console.error("❌ [eventApi::deleteEvent] eventId is required")
    return false
  }
  try {
    await http.delete(`/events/${encodeURIComponent(eventId)}`)
    return true
  } catch (error) {
    console.error("❌ [eventApi::deleteEvent]", error)
    return false
  }
}

export default {
  createEvent,
  fetchMyEvents,
  fetchAllEvents,
  joinEvent,
  leaveEvent,
  fetchEventById,
  updateEventProgress,
  deleteEvent,
}
