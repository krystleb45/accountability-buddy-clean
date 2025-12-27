"use client"

import { useMutation } from "@tanstack/react-query"
import { CheckCircle, Loader2, Mail, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

import { STORAGE_KEYS } from "@/constants/storageKeys"
import { useAuth } from "@/context/auth/auth-context"
import { http } from "@/lib/http"

import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

const MotionCard = motion.create(Card)

export function NewsletterCard() {
  const { user } = useAuth()
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBED) === "true"
  })

  const { mutate: subscribe, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      const response = await http.post("/newsletter/signup", {
        email: user?.email,
      })
      return response.data
    },
    onSuccess: () => {
      localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBED, "true")
      toast.success("You're subscribed to our newsletter!")
    },
    onError: (error) => {
      toast.error("Failed to subscribe", {
        description: error.message,
      })
    },
  })

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBED, "true")
  }

  if (isDismissed || isSuccess) {
    return null
  }

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-primary" />
          Stay Mission-Ready
          <Sparkles className="h-4 w-4 text-primary" />
        </CardTitle>
        <CardDescription>
          Get updates on new features, tips, and success stories!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            onClick={() => subscribe()}
            disabled={isPending}
            size="sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Subscribe with {user?.email}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={isPending}
          >
            No thanks
          </Button>
        </div>
      </CardContent>
    </MotionCard>
  )
}