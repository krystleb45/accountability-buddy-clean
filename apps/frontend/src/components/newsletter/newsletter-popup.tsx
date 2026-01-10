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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

const POPUP_DELAY_MS = 60000 // 60 seconds

export function NewsletterPopup() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const isSubscribed = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBED) === "true"
    const isDismissed = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_DISMISSED) === "true"
    
    if (isSubscribed || isDismissed || !user) return

    const timer = setTimeout(() => {
      setIsOpen(true)
    }, POPUP_DELAY_MS)

    return () => clearTimeout(timer)
  }, [user])

  const { mutate: subscribe, isPending } = useMutation({
    mutationFn: async () => {
      const response = await http.post("/newsletter/signup", {
        email: user?.email,
      })
      return response.data
    },
    onSuccess: () => {
      localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBED, "true")
      toast.success("You're subscribed to our newsletter!")
      setIsOpen(false)
    },
    onError: (error) => {
      toast.error("Failed to subscribe", {
        description: error.message,
      })
    },
  })

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER_DISMISSED, "true")
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Stay in the Loop!
          </DialogTitle>
          <DialogDescription>
            Get tips, feature updates, and success stories delivered to your inbox.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={() => subscribe()} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Subscribe with {user?.email}
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={handleDismiss} disabled={isPending}>
            No thanks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}