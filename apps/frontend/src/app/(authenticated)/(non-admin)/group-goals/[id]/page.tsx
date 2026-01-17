import type { Metadata } from "next"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Group Goal Details • Accountability Buddy",
  description: "View and manage your group goal progress with friends.",
}

const GroupGoalDetailClient = dynamic(() => import("./page.client"), {
  ssr: false,
})

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
