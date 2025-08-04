// src/services/authService.ts
import type { AxiosError } from "axios"

import { jwtDecode } from "jwt-decode"

import { http } from "@/utils/http"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface UserInfo {
  id: string
  name?: string
  email: string
  role: "admin" | "moderator" | "user"
  permissions?: string[]
}

// ——— Token helpers —————————————————————————————————————

/** Persist JWT to storage */
export function setToken(token: string, useSession = false): void {
  if (useSession) sessionStorage.setItem("token", token)
  else localStorage.setItem("token", token)
}

/** Remove stored JWT */
export function clearToken(): void {
  localStorage.removeItem("token")
  sessionStorage.removeItem("token")
}

/** Retrieve JWT (from either storage) */
export function getToken(): string | null {
  return localStorage.getItem("token") ?? sessionStorage.getItem("token")
}

/** Return true if token is expired or invalid */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token)
    return exp * 1000 < Date.now()
  } catch {
    return true
  }
}

/**
 * Always returns an object you can pass directly to Axios’s `headers` option.
 * If there’s no valid token, it just returns an empty object.
 */
export function getAuthHeader(): Record<string, string> {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

// ——— Auth calls —————————————————————————————————————————

const AuthService = {
  /** POST /api/auths/login */
  async login(
    creds: LoginCredentials,
  ): Promise<{ token: string; user: UserInfo }> {
    try {
      const { data } = await http.post<{
        token: string
        user: UserInfo
      }>("/auths/login", creds)
      setToken(data.token)
      return data
    } catch (err: unknown) {
      const e = err as AxiosError<{ message: string }>
      throw new Error(e.response?.data.message ?? "Failed to log in")
    }
  },

  /** POST /api/auths/register */
  async register(payload: RegisterData): Promise<UserInfo> {
    try {
      const { data } = await http.post<UserInfo>("/auths/register", payload)
      return data
    } catch (err: unknown) {
      const e = err as AxiosError<{ message: string }>
      throw new Error(e.response?.data.message ?? "Failed to register")
    }
  },

  /** POST /api/auths/refresh-token */
  async refreshToken(): Promise<void> {
    try {
      const { data } = await http.post<{ token: string }>(
        "/auths/refresh-token",
      )
      setToken(data.token)
    } catch {
      throw new Error("Could not refresh token, please sign in again")
    }
  },

  /** GET /api/auths/me */
  async getMe(): Promise<UserInfo> {
    const token = getToken()
    if (!token || isTokenExpired(token)) {
      throw new Error("Not authenticated")
    }
    const { data } = await http.get<{
      success: boolean
      data: UserInfo
    }>("/auths/me", {
      headers: getAuthHeader(),
    })
    return data.data
  },

  /** POST /api/auths/logout */
  async logout(): Promise<void> {
    try {
      await http.post("/auths/logout", null, { headers: getAuthHeader() })
    } finally {
      clearToken()
    }
  },
}

export default AuthService
