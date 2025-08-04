// src/context/data/UserSubscriptionContext.tsx
"use client"

import type { ReactNode } from "react"

import React, { createContext, use, useEffect, useState } from "react"

import type { User } from "@/types/User.types"

import { useAPI } from "./APIContext"

/** === API payload === */
export interface Subscription {
  plan: string
  status: "active" | "expired" | "canceled" | "pending"
  expiresAt: string
}

export interface SubscriptionApiResponse {
  user: User
  subscription: Subscription
}

/** === Context value shape === */
export interface UserSubscriptionContextType {
  user: User | null
  subscription: Subscription | null
  isSubscriptionActive: boolean
  /**
   * Fetches latest subscription and user data from the server,
   * updates context state, and returns the payload (or null on failure).
   */
  fetchSubscription: () => Promise<SubscriptionApiResponse | null>
  /** Update the user object in context */
  updateUser: (newUser: User) => void
}

const UserSubscriptionContext = createContext<
  UserSubscriptionContextType | undefined
>(undefined)

export function useUserSubscription(): UserSubscriptionContextType {
  const ctx = use(UserSubscriptionContext)
  if (!ctx) {
    throw new Error(
      "useUserSubscription must be used within a <UserSubscriptionProvider>",
    )
  }
  return ctx
}

export const UserSubscriptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { callAPI } = useAPI()
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  const fetchSubscription =
    async (): Promise<SubscriptionApiResponse | null> => {
      try {
        const data = await callAPI<SubscriptionApiResponse>({
          method: "get",
          url: "/subscription",
        })
        setUser(data.user)
        setSubscription(data.subscription)
        return data
      } catch (err) {
        console.error("Error fetching subscription:", err)
        return null
      }
    }

  const updateUser = (newUser: User): void => {
    setUser(newUser)
  }

  const isSubscriptionActive = Boolean(
    subscription &&
      subscription.status === "active" &&
      new Date(subscription.expiresAt) > new Date(),
  )

  useEffect(() => {
    fetchSubscription().catch(console.error)
  }, [])

  return (
    <UserSubscriptionContext
      value={{
        user,
        subscription,
        isSubscriptionActive,
        fetchSubscription,
        updateUser,
      }}
    >
      {children}
    </UserSubscriptionContext>
  )
}

export default UserSubscriptionProvider
