import type { Metadata } from "next"
import type { ReactNode } from "react"

import { RegisterProvider } from "./register-context"

export const metadata: Metadata = {
  title: "Start Your Free Trial – Accountability Buddy",
  description:
    "Create your Accountability Buddy account and choose your plan. Start with a 14-day free trial, then upgrade to unlock unlimited goals and premium features.",
  keywords:
    "accountability buddy, goal tracking, free trial, subscription plans, personal development",
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <RegisterProvider>
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-screen-xl">{children}</div>
      </div>
    </RegisterProvider>
  )
}
