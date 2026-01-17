import type { Metadata } from "next"

import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import GroupGoalDetailClient from "./page.client"

export const metadata: Metadata = {
  title: "Group Goal Details • Accountability Buddy",
  description: "View and manage your group goal progress with friends.",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupGoalDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  return <GroupGoalDetailClient goalId={id} />
}