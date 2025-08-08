// src/hooks/auth/useAuth.ts - Simplified with NextAuth.js
import { signIn, signOut, useSession } from "next-auth/react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export default function useAuth(): AuthReturn {
  const { data: session, status } = useSession()

  const login = async (email: string, password: string): Promise<void> => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error(result.error)
    }
  }

  const logout = async (): Promise<void> => {
    await signOut({ redirect: false })
  }

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role,
      }
    : null

  return {
    user,
    loading: status === "loading",
    error: null, // NextAuth handles errors differently
    login,
    logout,
    isAuthenticated: !!session,
  }
}
