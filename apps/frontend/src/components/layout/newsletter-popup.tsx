"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, LoaderCircle, Mail, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { STORAGE_KEYS } from "@/constants/storageKeys"
import { http } from "@/utils"

import { Button } from "../ui/button"
import { Dialog, DialogContent } from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"

const newsletterSignupSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Please enter your email address"),
})

type NewsletterSignup = z.infer<typeof newsletterSignupSchema>

const MotionButton = motion.create(Button)

interface NewsletterPopupProps {
  showAfterSeconds?: number
}

type Status = "idle" | "loading" | "success" | "error" | "already_subscribed"

function getSuccessMessage(status: Status) {
  if (status === "already_subscribed") {
    return {
      title: "You're Already In!",
      message:
        "Looks like you're already subscribed. Check your inbox for our latest updates!",
    }
  }
  return {
    title: "Welcome Aboard!",
    message:
      "You're now subscribed! Watch for updates on accountability features and military support resources.",
  }
}

export function NewsletterPopup({
  showAfterSeconds = 45,
}: NewsletterPopupProps) {
  const { data: session } = useSession()

  const [isVisible, setIsVisible] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm({
    resolver: zodResolver(newsletterSignupSchema),
    defaultValues: { email: "" },
  })

  useEffect(() => {
    // Check if user already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_DISMISSED)

    if (dismissed) {
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, showAfterSeconds * 1000)

    return () => clearTimeout(timer)
  }, [showAfterSeconds])

  const handleSubmit = async ({ email }: NewsletterSignup) => {
    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await http.post("/newsletter/signup", {
        email,
      })

      const data = response.data

      if (data.message.includes("Already subscribed")) {
        setStatus("already_subscribed")
      } else {
        setStatus("success")
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already subscribed")) {
          setStatus("already_subscribed")
        } else {
          setStatus("error")
          setErrorMessage(error.message)
        }

        return
      }

      setStatus("error")
      setErrorMessage("An unexpected error occurred. Please try again later.")
    } finally {
      setTimeout(() => setIsVisible(false), 4000)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsVisible(false)
      localStorage.setItem(STORAGE_KEYS.NEWSLETTER_DISMISSED, "true")
      return
    }

    setIsVisible(true)
    setStatus("idle")
    setErrorMessage("")
  }

  useEffect(() => {
    if (status === "error") {
      toast.error(errorMessage)
    }
  }, [status, errorMessage])

  const successMessage = useMemo(() => getSuccessMessage(status), [status])

  if (session?.user) {
    return null // Don't show popup if user is logged in
  }

  return (
    <Dialog open={isVisible} onOpenChange={handleOpenChange}>
      <DialogContent>
        <div className="text-center">
          {/* Success State */}
          {status === "success" || status === "already_subscribed" ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="py-4 text-center"
            >
              <div className="mb-4 text-primary">
                <CheckCircle className="mx-auto" size={48} />
              </div>
              <h4 className="mb-5 text-xl font-bold text-primary">
                {successMessage.title}
              </h4>
              <p className="text-pretty">{successMessage.message}</p>
            </motion.div>
          ) : (
            <>
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary p-3">
                  <Mail className="text-background" size={24} />
                </div>
              </div>

              {/* Header */}
              <h3
                className={`
                  mb-2 flex items-center justify-center gap-2 text-2xl font-bold
                `}
              >
                Stay Mission-Ready
                <Sparkles className="text-primary" size={20} />
              </h3>

              <p className="mb-6 leading-relaxed">
                Get updates on new accountability features, military support
                resources, and success stories from veterans crushing their
                goals!
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div
                          className={`
                            group flex items-center gap-2 rounded-md border
                            border-input px-3 py-1 shadow-xs
                            focus-within:border-ring focus-within:ring-[3px]
                            focus-within:ring-ring/50
                          `}
                        >
                          <Mail
                            className={`
                              text-muted-foreground transition-colors
                              group-focus-within:text-foreground
                            `}
                            size={20}
                          />
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              disabled={status === "loading"}
                              className={`
                                border-none p-0
                                focus-visible:ring-0
                              `}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <MotionButton
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                    size="lg"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoaderCircle className="animate-spin" size={16} />
                        Subscribing...
                      </span>
                    ) : (
                      "Join the Mission"
                    )}
                  </MotionButton>
                </form>
              </Form>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 border-t pt-4">
            <p
              className={`
                flex items-center justify-center gap-1 text-xs
                text-muted-foreground
              `}
            >
              🔒 No spam, unsubscribe anytime • 📧 Updates only
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
