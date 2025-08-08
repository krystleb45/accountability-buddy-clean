import type { Metadata } from "next"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Login — Accountability Buddy",
  description:
    "Log in to your Accountability Buddy account to track goals and connect with friends.",
}

// dynamically load the client form UI
const LoginForm = dynamic(() =>
  import("./login-form").then((mod) => mod.LoginForm),
)

export default async function LoginPageWrapper() {
  const session = await getServerSession(authOptions)
  if (session) {
    // already logged in
    redirect("/dashboard")
  }
  return <LoginForm />
}
