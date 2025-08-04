// src/app/register/page.tsx
import type { Metadata } from "next"

import RegisterForm from "./page.client"

export const metadata: Metadata = {
  title: "Start Your Free Trial – Accountability Buddy",
  description:
    "Create your Accountability Buddy account and choose your plan. Start with a 14-day free trial, then upgrade to unlock unlimited goals and premium features.",
  keywords:
    "accountability buddy, goal tracking, free trial, subscription plans, personal development",
  openGraph: {
    title: "Start Your Free Trial – Accountability Buddy",
    description:
      "Join thousands achieving their goals with accountability partners. Start with our 14-day free trial, then choose from Basic ($5), Pro ($15), or Elite ($30) plans.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/register`,
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/register-og.jpg`, // Add this image if you have one
        width: 1200,
        height: 630,
        alt: "Accountability Buddy Registration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Start Your Free Trial – Accountability Buddy",
    description:
      "Create your account and choose your plan. 14-day free trial included!",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterPage() {
  return <RegisterForm />
}
