// src/session/sessionApi.ts

import axios from "axios"

import { http } from "@/utils/http"

export interface Session {
  _id: string
  user: {
    _id: string
    email: string
    username?: string
  }
  token: string
  ipAddress: string
  device: string
  expiresAt: string
  isActive: boolean
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [sessionApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [sessionApi::${fn}]`, error)
  }
}

/** Create a new session (login) */
export async function login(
  email: string,
  password: string,
): Promise<{ token: string; sessionId: string } | null> {
  try {
    const resp = await http.post<{
      success: boolean
      token: string
      sessionId: string
    }>("/session/login", { email, password })
    return resp.data.success
      ? { token: resp.data.token, sessionId: resp.data.sessionId! }
      : null
  } catch (err) {
    logError("login", err)
    return null
  }
}

/** Logout of current session */
export async function logout(): Promise<boolean> {
  try {
    const resp = await http.post<{ success: boolean; message?: string }>(
      "/session/logout",
    )
    return resp.data.success
  } catch (err) {
    logError("logout", err)
    return false
  }
}

/** Invalidate all sessions except current */
export async function deleteAllSessions(
  currentSessionId: string,
): Promise<boolean> {
  try {
    const resp = await http.delete<{ success: boolean; message?: string }>(
      "/session/all",
      {
        data: { sessionId: currentSessionId },
      },
    )
    return resp.data.success
  } catch (err) {
    logError("deleteAllSessions", err)
    return false
  }
}

/** Refresh JWT on active session */
export async function refreshToken(): Promise<string | null> {
  try {
    const resp = await http.post<{ success: boolean; token: string }>(
      "/session/refresh",
    )
    return resp.data.success ? resp.data.token : null
  } catch (err) {
    logError("refreshToken", err)
    return null
  }
}

/** Fetch one session by ID */
export async function fetchSession(sessionId: string): Promise<Session | null> {
  try {
    const resp = await http.get<{ success: boolean; data: Session }>(
      `/session/${encodeURIComponent(sessionId)}`,
    )
    return resp.data.success ? resp.data.data! : null
  } catch (err) {
    logError("fetchSession", err)
    return null
  }
}

/** Fetch all active sessions */
export async function fetchUserSessions(): Promise<Session[]> {
  try {
    const resp = await http.get<{ success: boolean; data: Session[] }>(
      "/session",
    )
    return resp.data.success ? resp.data.data! : []
  } catch (err) {
    logError("fetchUserSessions", err)
    return []
  }
}

/** Delete a specific session */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    const resp = await http.delete<{ success: boolean; message?: string }>(
      `/session/${encodeURIComponent(sessionId)}`,
    )
    return resp.data.success
  } catch (err) {
    logError("deleteSession", err)
    return false
  }
}

export default {
  login,
  logout,
  deleteAllSessions,
  refreshToken,
  fetchSession,
  fetchUserSessions,
  deleteSession,
}
