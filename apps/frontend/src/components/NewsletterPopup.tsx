// src/components/NewsletterPopup.tsx - Enhanced Version
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, Mail, Sparkles, X } from "lucide-react"
import { useEffect, useState } from "react"

interface NewsletterPopupProps {
  showAfterSeconds?: number
}

export default function NewsletterPopup({
  showAfterSeconds = 45,
}: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "already_subscribed"
  >("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    // Check if user already dismissed or signed up
    const dismissed = localStorage.getItem("newsletter-dismissed")
    const signedUp = localStorage.getItem("newsletter-signed-up")

    if (dismissed || signedUp) return

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, showAfterSeconds * 1000)

    return () => clearTimeout(timer)
  }, [showAfterSeconds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.message.includes("Already subscribed")) {
          setStatus("already_subscribed")
        } else {
          setStatus("success")
          localStorage.setItem("newsletter-signed-up", "true")
        }
        setTimeout(() => setIsVisible(false), 4000)
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
        setTimeout(() => setStatus("idle"), 4000)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      setStatus("error")
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      )
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("newsletter-dismissed", "true")
  }

  const getSuccessMessage = () => {
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md rounded-xl border border-gray-600 bg-gray-800 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              {/* Success State */}
              {status === "success" || status === "already_subscribed" ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="py-4 text-center"
                >
                  <div className="mb-4 text-green-400">
                    <CheckCircle className="mx-auto size-16" />
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-green-400">
                    {getSuccessMessage().title}
                  </h4>
                  <p className="text-gray-300">{getSuccessMessage().message}</p>
                </motion.div>
              ) : (
                /* Form State */
                <>
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-green-400 p-3">
                      <Mail className="text-black" size={24} />
                    </div>
                  </div>

                  {/* Header */}
                  <h3 className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold text-white">
                    Stay Mission-Ready
                    <Sparkles className="text-green-400" size={20} />
                  </h3>

                  <p className="mb-6 leading-relaxed text-gray-300">
                    Get updates on new accountability features, military support
                    resources, and success stories from veterans crushing their
                    goals!
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        disabled={status === "loading"}
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 py-3 pl-10 pr-4 text-white transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-lg bg-green-400 px-6 py-3 font-semibold text-black transition-all hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="size-5 animate-spin"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Subscribing...
                        </span>
                      ) : (
                        "Join the Mission"
                      )}
                    </motion.button>

                    {status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm text-red-400"
                      >
                        {errorMessage}
                      </motion.p>
                    )}
                  </form>
                </>
              )}

              {/* Footer */}
              <div className="mt-6 border-t border-gray-700 pt-4">
                <p className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  🔒 No spam, unsubscribe anytime • 📧 Updates only
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
