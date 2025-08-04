// src/context/auth/AuthContext.tsx
"use client"

import type { ReactNode } from "react"

import axios from "axios"
import { useRouter } from "next/navigation"
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import { ROUTES } from "@/constants/routePaths"
import { STORAGE_KEYS } from "@/constants/storageKeys"
import { http } from "@/utils/http"

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function useAuth(): AuthContextType {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  )
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Persist token
  useEffect(() => {
    if (token) sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    else sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }, [token])

  // Auto-attach token to every http request
  useEffect(() => {
    const id = http.interceptors.request.use((config) => {
      if (token) config.headers!.Authorization = `Bearer ${token}`
      return config
    })
    return () => http.interceptors.request.eject(id)
  }, [token])

  // Login
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        const { data } = await http.post<{
          token: string
          user: User
        }>("/auth/login", { email, password })
        setToken(data.token)
        router.push(ROUTES.DASHBOARD)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw new Error(err.response?.data?.message || "Login failed")
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  // Logout
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    router.replace(ROUTES.LOGIN)
  }, [router])

  // Load current user
  const refreshUser = async () => {
    if (!token) return
    setLoading(true)
    try {
      const { data } = await http.get<{ user: User }>("/auth/me")
      setUser({
        ...data.user,
        avatarUrl: data.user.avatarUrl || "/default-avatar.png",
      })
    } catch (err) {
      console.error(err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) refreshUser()
  }, [token])

  const ctxValue = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout],
  )

  return <AuthContext value={ctxValue}>{children}</AuthContext>
}
