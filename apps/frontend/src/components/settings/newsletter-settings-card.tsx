"use client"

import { useMutation } from "@tanstack/react-query"
import { CheckCircle, Loader2, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { STORAGE_KEYS } from "@/constants/storageKeys"
import { useAuth } from "@/context/auth/auth-context"
import { http } from "@/lib/http"

import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

export function NewsletterSettingsCard() {
  const { user } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    setIsSubscribed(
      localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBED) === "true"
    )
  }, [])

  const { mutate: subscribe, isPending } = useMutation({
    mutationFn: async () => {
      const response = await http.post("/newsletter/signup", {
        email: user?.email,
      })
      return response.data
    },
    onSuccess: () => {
      localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBED, "true")
      localStorage.removeItem(STORAGE_KEYS.NEWSLETTER_DISMISSED)
      setIsSubscribed(true)
      toast.success("You're subscribed to our newsletter!")
    },
    onError: (error) => {
      toast.error("Failed to subscribe", {
        description: error.message,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Newsletter
        </CardTitle>
        <CardDescription>
          Get updates on new features, tips, and success stories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            You're subscribed with {user?.email}
          </div>
        ) : (
          <Button onClick={() => subscribe()} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe with {user?.email}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}